import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { Transaction } from "@mysten/sui/transactions";
import { publicEnv } from "@/lib/env";
import { getSuiClient } from "@/lib/sui/client";
import { sponsorKeypair } from "@/lib/sui/keys";

const Schema = z.object({ address: z.string().refine(isValidSuiAddress) });

// Small top-up so a donor has something to donate (gas is always sponsored).
// Tries the public testnet faucet first; falls back to a transfer from the
// sponsor key when the faucet is rate-limited (common behind Vercel's shared IPs).
const FALLBACK_MIST = 100_000_000n; // 0.1 SUI

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  const { address } = parsed.data;

  if (publicEnv.suiNetwork === "mainnet") {
    return NextResponse.json({ error: "Faucet is testnet-only." }, { status: 400 });
  }

  try {
    await requestSuiFromFaucetV2({
      host: getFaucetHost(publicEnv.suiNetwork),
      recipient: address,
    });
    return NextResponse.json({ ok: true, source: "faucet" });
  } catch {
    // Fall back to a sponsor transfer.
    try {
      const client = getSuiClient();
      const sponsor = sponsorKeypair();
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [FALLBACK_MIST]);
      tx.transferObjects([coin], address);
      const res = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: sponsor,
        include: { effects: true },
      });
      const done = res.Transaction ?? res.FailedTransaction;
      if (!done || !done.effects.status.success) throw new Error("transfer failed");
      await client.waitForTransaction({ digest: done.digest });
      return NextResponse.json({ ok: true, source: "sponsor", digest: done.digest });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Top-up failed";
      return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }
  }
}
