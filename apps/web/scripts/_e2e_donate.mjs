import { readFileSync } from "node:fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
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
const sponsor = Ed25519Keypair.fromSecretKey(env.SPONSOR_PRIVATE_KEY);

const kp = Ed25519Keypair.generate();
const addr = kp.toSuiAddress();
console.log("donor:", addr);

// Fund the donor from the sponsor key (faucet is rate-limited).
{
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [50_000_000n]);
  tx.transferObjects([coin], addr);
  const r = await c.signAndExecuteTransaction({ transaction: tx, signer: sponsor, include: { effects: true } });
  const d = r.Transaction ?? r.FailedTransaction;
  if (!d?.effects.status.success) throw new Error("fund failed: " + JSON.stringify(d?.effects.status.error));
  await c.waitForTransaction({ digest: d.digest });
  const { balance } = await c.getBalance({ owner: addr });
  console.log("funded:", Number(balance.balance) / 1e9, "SUI");
}

const amountMist = "20000000";
console.log("· POST /api/sponsor donate", amountMist);
const s = await fetch(`${BASE}/api/sponsor`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "donate", sender: addr, params: { amountMist } }),
});
const sj = await s.json();
if (!s.ok) throw new Error("sponsor failed: " + JSON.stringify(sj));

const { signature } = await kp.signTransaction(fromBase64(sj.txBytes));
const e = await fetch(`${BASE}/api/execute`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ txBytes: sj.txBytes, sponsorSignature: sj.sponsorSignature, senderSignature: signature }),
});
const ej = await e.json();
console.log("execute:", JSON.stringify(ej));
if (!ej.success) process.exit(1);

const roles = await (await fetch(`${BASE}/api/session?address=${addr}`)).json();
console.log("donor roles → hasDonated:", roles.hasDonated, "total:", roles.donationTotal);
const dash = await (await fetch(`${BASE}/api/dashboard`)).json().catch(() => null);
if (dash) console.log("dashboard treasury:", dash.treasuryBalance, "donations:", dash.donations?.length);
