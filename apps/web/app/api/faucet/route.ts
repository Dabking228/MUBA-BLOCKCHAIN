import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { publicEnv } from "@/lib/env";

const Schema = z.object({ address: z.string().refine(isValidSuiAddress) });

// Testnet faucet proxy — used by dev-login donor wallets to get spendable SUI.
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  try {
    await requestSuiFromFaucetV2({
      host: getFaucetHost(publicEnv.suiNetwork === "mainnet" ? "testnet" : publicEnv.suiNetwork),
      recipient: parsed.data.address,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Faucet request failed";
    const rateLimited = /rate|limit|429/i.test(message);
    return NextResponse.json(
      { ok: false, error: rateLimited ? "Faucet rate limit hit — try again in a minute." : message },
      { status: rateLimited ? 429 : 502 },
    );
  }
}
