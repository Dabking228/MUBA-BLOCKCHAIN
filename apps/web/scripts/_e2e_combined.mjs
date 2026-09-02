import { readFileSync } from "node:fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64 } from "@mysten/sui/utils";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const BASE = "http://localhost:3000";
const c = new SuiGrpcClient({ network: "testnet", baseUrl: env.NEXT_PUBLIC_SUI_RPC_URL });
const sponsor = Ed25519Keypair.fromSecretKey(env.SPONSOR_PRIVATE_KEY);
const official = Ed25519Keypair.fromSecretKey(env.DEMO_OFFICIAL_KEY);

async function act(kp, action, params) {
  const s = await fetch(`${BASE}/api/sponsor`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, sender: kp.toSuiAddress(), params }),
  });
  const sj = await s.json();
  if (!s.ok) throw new Error(`${action}: ${JSON.stringify(sj)}`);
  const { signature } = await kp.signTransaction(fromBase64(sj.txBytes));
  const e = await fetch(`${BASE}/api/execute`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBytes: sj.txBytes, sponsorSignature: sj.sponsorSignature, senderSignature: signature }),
  });
  const ej = await e.json();
  if (!ej.success) throw new Error(`${action} exec: ${ej.error}`);
  return ej.digest;
}

// One wallet that is BOTH a donor and a household.
const person = Ed25519Keypair.generate();
const addr = person.toSuiAddress();
console.log("person:", addr);
console.log("PERSON_KEY:", person.getSecretKey());
{
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [60_000_000n]);
  tx.transferObjects([coin], addr);
  const r = await c.signAndExecuteTransaction({ transaction: tx, signer: sponsor, include: { effects: true } });
  await c.waitForTransaction({ digest: (r.Transaction ?? r.FailedTransaction).digest });
}

console.log("donate 0.03 …", await act(person, "donate", { amountMist: "30000000" }));

// Official registers this person's household (PPS auto-verify).
const caps = await (await fetch(`${BASE}/api/caps?address=${official.toSuiAddress()}`)).json();
const pps = caps.registrarCaps.find((x) => x.channel === 0);
const rc = await (await fetch(`${BASE}/api/reference-code`, { method: "POST" })).json();
const hhId = `COMBINED-${Date.now()}`;
console.log("register …", await act(official, "register_household", {
  registrarCapId: pps.capId, zoneId: env.NEXT_PUBLIC_ZONE_ID,
  householdId: hhId, referenceCodeHashHex: rc.codeHash, postcode: "43100", tier: 0,
}));

const look = await (await fetch(`${BASE}/api/claim/lookup`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: rc.code }),
})).json();
console.log("claim …", await act(person, "claim_and_link", { registrationId: look.registrationId, code: rc.code.toUpperCase() }));

await new Promise((r) => setTimeout(r, 1500));
const home = await (await fetch(`${BASE}/api/home?address=${addr}`)).json();
console.log("HOME roles:", JSON.stringify({
  hasDonated: home.roles.hasDonated, donationTotal: home.roles.donationTotal,
  households: home.roles.households.map((h) => ({ id: h.householdId, status: h.status, claimed: h.claimed })),
}));
console.log("donations list:", home.donations.length, "balance:", home.balance);
