"use client";

import type { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";
import type { SponsoredAction } from "@/lib/types";

/** Run a whitelisted sponsored action: sponsor builds + signs, we sign, server executes. */
export async function runSponsoredAction(
  keypair: Ed25519Keypair,
  action: SponsoredAction,
  params: Record<string, unknown>,
): Promise<string> {
  const sender = keypair.toSuiAddress();

  const prep = await fetch("/api/sponsor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, sender, params }),
  });
  const prepJson = await prep.json();
  if (!prep.ok) throw new Error(prepJson.error ?? "Could not prepare the transaction.");

  const { txBytes, sponsorSignature } = prepJson as { txBytes: string; sponsorSignature: string };
  const { signature: senderSignature } = await keypair.signTransaction(fromBase64(txBytes));

  const exec = await fetch("/api/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBytes, sponsorSignature, senderSignature }),
  });
  const execJson = await exec.json();
  if (!exec.ok || !execJson.success) {
    throw new Error(execJson.error ?? "The transaction failed.");
  }
  return execJson.digest as string;
}

export async function requestFaucet(address: string): Promise<void> {
  const res = await fetch("/api/faucet", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? "Faucet request failed.");
  }
}
