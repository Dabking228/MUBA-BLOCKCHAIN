import { readFileSync } from "node:fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const BASE = process.env.BASE ?? "http://localhost:3000";
const c = new SuiGrpcClient({ network: "testnet", baseUrl: env.NEXT_PUBLIC_SUI_RPC_URL });

const official = Ed25519Keypair.fromSecretKey(env.DEMO_OFFICIAL_KEY);
const officialAddr = official.toSuiAddress();
console.log("official:", officialAddr);

const caps = await (await fetch(`${BASE}/api/caps?address=${officialAddr}`)).json();
console.log("caps:", JSON.stringify(caps.registrarCaps));
const ppsCap = caps.registrarCaps.find((c) => c.channel === 0); // PPS → auto-verify
const clCap = caps.registrarCaps.find((c) => c.channel === 1); // community leader → pending

async function register(cap, householdId, tier) {
  const rc = await (await fetch(`${BASE}/api/reference-code`, { method: "POST" })).json();
  const s = await fetch(`${BASE}/api/sponsor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "register_household",
      sender: officialAddr,
      params: {
        registrarCapId: cap.capId,
        zoneId: env.NEXT_PUBLIC_ZONE_ID,
        householdId,
        referenceCodeHashHex: rc.codeHash,
        postcode: "43000",
        tier,
      },
    }),
  });
  const sj = await s.json();
  if (!s.ok) throw new Error("sponsor: " + JSON.stringify(sj));
  const { signature } = await official.signTransaction(fromBase64(sj.txBytes));
  const e = await fetch(`${BASE}/api/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBytes: sj.txBytes, sponsorSignature: sj.sponsorSignature, senderSignature: signature }),
  });
  const ej = await e.json();
  console.log(`register ${householdId} (ch${cap.channel}):`, JSON.stringify(ej));
  return { ...ej, code: rc.code };
}

const stamp = Date.now();
const r1 = await register(ppsCap, `PPS-${stamp}`, 1);
const r2 = await register(clCap, `CL-${stamp}`, 2);

// Duplicate must fail at register_household.
try {
  const dup = await register(ppsCap, `PPS-${stamp}`, 0);
  console.log("DUPLICATE result (expect success:false):", dup.success, dup.error);
} catch (e) {
  console.log("duplicate threw (ok):", e.message);
}

await new Promise((r) => setTimeout(r, 1500));
const rows = await (await fetch(`${BASE}/api/dashboard`)).json();
console.log("pipeline:", JSON.stringify(rows.pipeline));

// dump one registration object shape
const evts = await c.listEvents({ filter: { eventType: `${env.NEXT_PUBLIC_PACKAGE_ID}::relief_v3::RegistrationSubmitted` }, order: "descending", limit: 1 });
const regId = evts.events[0]?.json?.registration_id;
if (regId) {
  const { object } = await c.getObject({ objectId: regId, include: { json: true } });
  console.log("REGISTRATION JSON:", JSON.stringify(object.json, null, 1));
}
console.log("codes:", { r1: r1.code, r2: r2.code });
