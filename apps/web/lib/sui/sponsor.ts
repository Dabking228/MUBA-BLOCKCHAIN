import "server-only";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64, toBase64 } from "@mysten/sui/utils";
import type { Signer } from "@mysten/sui/cryptography";
import { getSuiClient } from "@/lib/sui/client";
import { sponsorKeypair } from "@/lib/sui/keys";
import { explainError, isZkLoginSignatureError } from "@/lib/sui/errors";

type Thunk = (tx: Transaction) => void;

const GAS_BUDGET = 30_000_000n; // 0.03 SUI — generous for a single moveCall

/**
 * Build a transaction for `sender`, paid for by the sponsor, and pre-sign it
 * with the sponsor key. The client then signs the same bytes and calls
 * `executeSponsored`.
 */
export async function buildSponsored(thunk: Thunk, sender: string) {
  const client = getSuiClient();
  const sponsor = sponsorKeypair();
  const sponsorAddr = sponsor.toSuiAddress();

  // Pick the sponsor's largest SUI coin as the gas payment.
  const coins = await client.listCoins({ owner: sponsorAddr, coinType: "0x2::sui::SUI" });
  if (coins.objects.length === 0) {
    throw new Error("Sponsor account has no SUI to pay for gas.");
  }
  const gasCoin = [...coins.objects].sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)))[0];

  const tx = new Transaction();
  thunk(tx);
  tx.setSender(sender);
  tx.setGasOwner(sponsorAddr);
  tx.setGasBudget(GAS_BUDGET);
  tx.setGasPayment([
    { objectId: gasCoin.objectId, version: String(gasCoin.version), digest: gasCoin.digest },
  ]);

  const txBytes = await tx.build({ client });
  const { signature } = await sponsor.signTransaction(txBytes);

  return { txBytes: toBase64(txBytes), sponsorSignature: signature };
}

/** Execute a sponsored transaction given both signatures. Returns the digest. */
export async function executeSponsored(params: {
  txBytes: string;
  sponsorSignature: string;
  senderSignature: string;
}) {
  const client = getSuiClient();
  let result;
  try {
    result = await client.executeTransaction({
      transaction: fromBase64(params.txBytes),
      signatures: [params.senderSignature, params.sponsorSignature],
      include: { effects: true, events: true },
    });
  } catch (err) {
    // A bad signature (e.g. a stale/invalid zkLogin proof) is rejected before
    // execution — the client throws rather than returning a FailedTransaction.
    if (isZkLoginSignatureError(err)) {
      console.error("[executeSponsored] zkLogin signature failed verification:", err);
    }
    throw err;
  }

  const tx = result.Transaction ?? result.FailedTransaction;
  if (!tx || !tx.effects.status.success) {
    throw new Error(explainError(tx?.effects.status.error));
  }

  await client.waitForTransaction({ digest: tx.digest });
  return { digest: tx.digest, events: tx.events ?? [] };
}

/** Admin / script path: sign and execute directly with a keypair. */
export async function executeWithKeypair(thunk: Thunk, signer: Signer) {
  const client = getSuiClient();
  const tx = new Transaction();
  thunk(tx);
  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    include: { effects: true, events: true, objectTypes: true },
  });
  const done = result.Transaction ?? result.FailedTransaction;
  if (!done || !done.effects.status.success) {
    throw new Error(explainError(done?.effects.status.error));
  }
  await client.waitForTransaction({ digest: done.digest });
  return done;
}
