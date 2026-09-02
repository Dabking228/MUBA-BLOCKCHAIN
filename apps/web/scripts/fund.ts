/** Send a little testnet SUI from the sponsor key to an address (faucet fallback).
 *  npx tsx scripts/fund.ts <address> [amountSui=0.1]
 */
import { loadEnvConfig } from "@next/env";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiGrpcClient } from "@mysten/sui/grpc";

loadEnvConfig(process.cwd());

const [, , to, amountSui = "0.1"] = process.argv;
if (!to) throw new Error("usage: tsx scripts/fund.ts <address> [amountSui]");

const client = new SuiGrpcClient({
  network: "testnet",
  baseUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL!,
});
const kp = Ed25519Keypair.fromSecretKey(process.env.SPONSOR_PRIVATE_KEY!);
const mist = BigInt(Math.round(Number(amountSui) * 1e9));

const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [mist]);
tx.transferObjects([coin], to);

const res = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: kp,
  include: { effects: true },
});
const done = res.Transaction ?? res.FailedTransaction;
console.log(done?.digest, done?.effects.status.success ? "OK" : JSON.stringify(done?.effects.status.error));
await client.waitForTransaction({ digest: done!.digest });
const { balance } = await client.getBalance({ owner: to });
console.log("new balance:", Number(balance.balance) / 1e9, "SUI");
