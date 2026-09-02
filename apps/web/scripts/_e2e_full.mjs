import { readFileSync } from "node:fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const [, , ppsCode, clCode] = process.argv;
if (!ppsCode || !clCode) throw new Error("usage: node scripts/_e2e_full.mjs <ppsCode> <clCode>");

const BASE = "http://localhost:3000";
const c = new SuiGrpcClient({ network: "testnet", baseUrl: env.NEXT_PUBLIC_SUI_RPC_URL });
const sponsor = Ed25519Keypair.fromSecretKey(env.SPONSOR_PRIVATE_KEY);
const verifier = Ed25519Keypair.fromSecretKey(env.DEMO_VERIFIER_KEY);

async function sponsoredAction(kp, action, params) {
  const sender = kp.toSuiAddress();
  const s = await fetch(`${BASE}/api/sponsor`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, sender, params }),
  });
  const sj = await s.json();
  if (!s.ok) throw new Error(`sponsor ${action}: ${JSON.stringify(sj)}`);
  const { signature } = await kp.signTransaction(fromBase64(sj.txBytes));
  const e = await fetch(`${BASE}/api/execute`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBytes: sj.txBytes, sponsorSignature: sj.sponsorSignature, senderSignature: signature }),
  });
  const ej = await e.json();
  if (!ej.success) throw new Error(`execute ${action}: ${ej.error}`);
  return ej.digest;
}

// 1. Verify the pending CL registration.
const clLookup = await (await fetch(`${BASE}/api/claim/lookup`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: clCode }),
})).json();
console.log("CL registration:", clLookup.registrationId, "status", clLookup.status);
if (clLookup.status === 0) {
  const d = await sponsoredAction(verifier, "verify_registration", {
    verifierCapId: (await (await fetch(`${BASE}/api/caps?address=${verifier.toSuiAddress()}`)).json()).verifierCapId,
    registrationId: clLookup.registrationId,
  });
  console.log("  verified:", d);
}

// 2+3. New household claims + releases the PPS registration.
const household = Ed25519Keypair.generate();
console.log("household:", household.toSuiAddress());
{
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [3_000_000n]);
  tx.transferObjects([coin], household.toSuiAddress());
  const r = await c.signAndExecuteTransaction({ transaction: tx, signer: sponsor, include: { effects: true } });
  await c.waitForTransaction({ digest: (r.Transaction ?? r.FailedTransaction).digest });
}

const ppsLookup = await (await fetch(`${BASE}/api/claim/lookup`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: ppsCode }),
})).json();
console.log("PPS registration:", ppsLookup.registrationId, "canClaim", ppsLookup.canClaim);

const claimDigest = await sponsoredAction(household, "claim_and_link", {
  registrationId: ppsLookup.registrationId, code: ppsCode.trim().toUpperCase(),
});
console.log("  claim_and_link:", claimDigest);

const before = BigInt((await c.getBalance({ owner: household.toSuiAddress() })).balance.balance);
const releaseDigest = await sponsoredAction(household, "release_funds", {
  registrationId: ppsLookup.registrationId, zoneId: ppsLookup.zoneId,
});
console.log("  release_funds:", releaseDigest);
await c.waitForTransaction({ digest: releaseDigest });
const after = BigInt((await c.getBalance({ owner: household.toSuiAddress() })).balance.balance);
console.log(`  household balance: ${Number(before) / 1e9} -> ${Number(after) / 1e9} SUI (delta ${Number(after - before) / 1e9})`);

await new Promise((r) => setTimeout(r, 1500));
const dash = await (await fetch(`${BASE}/api/dashboard`)).json();
console.log("dashboard pipeline:", JSON.stringify(dash.pipeline));
console.log("zone budget_spent:", dash.zones[0]?.budgetSpent, "/ cap", dash.zones[0]?.budgetCap);
console.log("recent payouts:", dash.recentPayouts.map((p) => ({ h: p.householdId, amt: p.paidAmount })));
