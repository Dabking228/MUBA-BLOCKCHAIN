/**
 * One-time on-chain + mirror setup for the MySteadyAid demo.
 *
 *   npx tsx scripts/seed.ts
 *
 * Idempotency: if TREASURY_ID / ZONE_ID are already in .env.local it skips
 * creating them. Re-run after a contract redeploy (clear those vars first).
 *
 * Writes results back into apps/web/.env.local and scripts/seed-output.json,
 * and upserts the zone/treasury rows into Supabase.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { SuiGrpcClient } from "@mysten/sui/grpc";

loadEnvConfig(process.cwd());

const ENV_PATH = resolve(process.cwd(), ".env.local");
const OUT_PATH = resolve(process.cwd(), "scripts/seed-output.json");

const RPC = process.env.NEXT_PUBLIC_SUI_RPC_URL!;
const PKG = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const MODULE = "relief_v3";
const SUI = "0x2::sui::SUI";
const t = (fn: string) => `${PKG}::${MODULE}::${fn}`;

const client = new SuiGrpcClient({ network: "testnet", baseUrl: RPC });
const admin = Ed25519Keypair.fromSecretKey(process.env.ADMIN_PRIVATE_KEY!);
const adminAddr = admin.toSuiAddress();

const cfg = {
  adminCapId: process.env.ADMIN_CAP_ID!,
  zoneName: process.env.SEED_ZONE_NAME ?? "Kampung Test Flood 2026",
  postcodes: (process.env.SEED_ELIGIBLE_POSTCODES ?? "43000,43100,43200").split(",").map((s) => s.trim()),
  budgetCap: BigInt(process.env.SEED_BUDGET_CAP ?? "2000000000"),
  tier: [
    BigInt(process.env.SEED_TIER0_AMOUNT ?? "50000000"),
    BigInt(process.env.SEED_TIER1_AMOUNT ?? "100000000"),
    BigInt(process.env.SEED_TIER2_AMOUNT ?? "200000000"),
  ],
  treasuryFund: BigInt(process.env.SEED_TREASURY_FUND ?? "400000000"),
};

function upsertEnv(updates: Record<string, string>) {
  let text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  for (const [k, v] of Object.entries(updates)) {
    const line = `${k}=${v}`;
    const re = new RegExp(`^${k}=.*$`, "m");
    text = re.test(text) ? text.replace(re, line) : text.trimEnd() + `\n${line}\n`;
  }
  writeFileSync(ENV_PATH, text);
}

async function exec(build: (tx: Transaction) => void, signer: Ed25519Keypair = admin) {
  const tx = new Transaction();
  build(tx);
  const res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    include: { effects: true, objectTypes: true },
  });
  const done = res.Transaction ?? res.FailedTransaction;
  if (!done || !done.effects.status.success) {
    throw new Error(`tx failed: ${JSON.stringify(done?.effects.status.error)}`);
  }
  await client.waitForTransaction({ digest: done.digest });
  return done as NonNullable<typeof res.Transaction>;
}

function createdOfType(done: { effects: { changedObjects: { objectId: string; idOperation: string }[] }; objectTypes?: Record<string, string> }, typeSubstr: string) {
  const types = done.objectTypes ?? {};
  for (const co of done.effects.changedObjects) {
    if (co.idOperation === "Created" && (types[co.objectId] ?? "").includes(typeSubstr)) {
      return co.objectId;
    }
  }
  throw new Error(`no created object matching ${typeSubstr}; types=${JSON.stringify(types)}`);
}

async function ensureAdminGas() {
  const { balance } = await client.getBalance({ owner: adminAddr });
  if (BigInt(balance.balance) > cfg.treasuryFund + 100_000_000n) return;
  console.log("· admin balance low, requesting faucet…");
  try {
    await requestSuiFromFaucetV2({ host: getFaucetHost("testnet"), recipient: adminAddr });
    await new Promise((r) => setTimeout(r, 4000));
  } catch (e) {
    console.warn("  faucet request failed (continuing):", (e as Error).message);
  }
}

async function main() {
  console.log("admin:", adminAddr);
  const cap = await client.getObject({ objectId: cfg.adminCapId, include: {} });
  const owner = cap.object.owner;
  if (owner.$kind !== "AddressOwner" || owner.AddressOwner !== adminAddr) {
    throw new Error(`ADMIN_PRIVATE_KEY does not own AdminCap ${cfg.adminCapId} (owner ${JSON.stringify(owner)})`);
  }

  await ensureAdminGas();

  const out: Record<string, string> = {};

  // ---- Treasury ----
  let treasuryId = process.env.NEXT_PUBLIC_TREASURY_ID;
  if (!treasuryId) {
    console.log("· create_treasury", cfg.treasuryFund.toString(), "MIST");
    const done = await exec((tx) => {
      const [coin] = tx.splitCoins(tx.gas, [cfg.treasuryFund]);
      tx.moveCall({ target: t("create_treasury"), typeArguments: [SUI], arguments: [tx.object(cfg.adminCapId), coin] });
    });
    treasuryId = createdOfType(done, "ReliefTreasury");
    console.log("  treasury:", treasuryId);
  } else {
    console.log("· treasury already set:", treasuryId);
  }
  out.NEXT_PUBLIC_TREASURY_ID = treasuryId!;

  // ---- Zone + tiers ----
  let zoneId = process.env.NEXT_PUBLIC_ZONE_ID;
  if (!zoneId) {
    console.log("· register_disaster_zone", cfg.zoneName);
    const done = await exec((tx) => {
      tx.moveCall({
        target: t("register_disaster_zone"),
        arguments: [
          tx.object(cfg.adminCapId),
          tx.pure.string(cfg.zoneName),
          tx.pure.vector("string", cfg.postcodes),
          tx.pure.u64(cfg.budgetCap),
        ],
      });
    });
    zoneId = createdOfType(done, "DisasterZone");
    console.log("  zone:", zoneId);
    for (let tier = 0; tier < cfg.tier.length; tier++) {
      console.log(`· set_tier_amount ${tier} = ${cfg.tier[tier]}`);
      await exec((tx) => {
        tx.moveCall({
          target: t("set_tier_amount"),
          arguments: [tx.object(cfg.adminCapId), tx.object(zoneId!), tx.pure.u8(tier), tx.pure.u64(cfg.tier[tier])],
        });
      });
    }
  } else {
    console.log("· zone already set:", zoneId);
  }
  out.NEXT_PUBLIC_ZONE_ID = zoneId!;

  // ---- Demo official + verifier keypairs and caps ----
  let officialKey = process.env.DEMO_OFFICIAL_KEY;
  let verifierKey = process.env.DEMO_VERIFIER_KEY;
  if (!officialKey || !verifierKey) {
    const official = Ed25519Keypair.generate();
    const verifier = Ed25519Keypair.generate();
    officialKey = official.getSecretKey();
    verifierKey = verifier.getSecretKey();
    console.log("· issuing RegistrarCap x3 to demo official", official.toSuiAddress());
    for (let channel = 0; channel < 3; channel++) {
      await exec((tx) => {
        tx.moveCall({
          target: t("issue_registrar_cap"),
          arguments: [tx.object(cfg.adminCapId), tx.pure.address(official.toSuiAddress()), tx.pure.u8(channel)],
        });
      });
    }
    console.log("· issuing VerifierCap to demo verifier", verifier.toSuiAddress());
    await exec((tx) => {
      tx.moveCall({
        target: t("issue_verifier_cap"),
        arguments: [tx.object(cfg.adminCapId), tx.pure.address(verifier.toSuiAddress())],
      });
    });
    out.DEMO_OFFICIAL_KEY = officialKey;
    out.DEMO_VERIFIER_KEY = verifierKey;
    out.DEMO_OFFICIAL_ADDRESS = official.toSuiAddress();
    out.DEMO_VERIFIER_ADDRESS = verifier.toSuiAddress();
  } else {
    console.log("· demo official/verifier keys already set");
  }

  upsertEnv(out);
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log("\nwrote", ENV_PATH, "and", OUT_PATH);
  console.log(out);

  // ---- Mirror the zone + treasury into Supabase ----
  await mirror(zoneId!, treasuryId!);
}

async function mirror(zoneId: string, treasuryId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const zone = await client.getObject({ objectId: zoneId, include: { json: true } });
  const j = (zone.object.json ?? {}) as Record<string, any>;
  const tierAmounts: Record<string, string> = {};
  for (let i = 0; i < cfg.tier.length; i++) tierAmounts[i] = cfg.tier[i].toString();
  const { error } = await sb.from("disaster_zones").upsert({
    id: zoneId,
    name: j.name ?? cfg.zoneName,
    active: j.active ?? true,
    eligible_postcodes: cfg.postcodes,
    tier_amounts: tierAmounts,
    budget_cap: (j.budget_cap ?? cfg.budgetCap).toString(),
    budget_spent: (j.budget_spent ?? 0).toString(),
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn("supabase zone upsert:", error.message);
  else console.log("mirrored zone → supabase");
  console.log("treasury id:", treasuryId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
