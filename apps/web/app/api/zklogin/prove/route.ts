import { NextResponse } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/env";
import { verifyGoogleJwt } from "@/lib/zklogin/salt";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Schema = z.object({
  jwt: z.string().min(20),
  extendedEphemeralPublicKey: z.string(),
  maxEpoch: z.union([z.number(), z.string()]),
  jwtRandomness: z.string(),
  salt: z.string(),
  keyClaimName: z.literal("sub"),
});

// Proxies the Mysten zkLogin prover (avoids browser CORS, keeps the URL server-side).
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prover request" }, { status: 400 });
  }

  try {
    // Re-verify the token before spending a prover call on it.
    await verifyGoogleJwt(parsed.data.jwt);

    const res = await fetch(serverEnv().zkloginProverUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jwt: parsed.data.jwt,
        extendedEphemeralPublicKey: parsed.data.extendedEphemeralPublicKey,
        maxEpoch: String(parsed.data.maxEpoch),
        jwtRandomness: parsed.data.jwtRandomness,
        salt: parsed.data.salt,
        keyClaimName: parsed.data.keyClaimName,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[zklogin prover]", res.status, text.slice(0, 300));
      return NextResponse.json(
        { error: `Prover returned ${res.status}. Try again in a moment.` },
        { status: 502 },
      );
    }
    return new NextResponse(text, { headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error("[/api/zklogin/prove]", err);
    return NextResponse.json({ error: "Proof request failed." }, { status: 502 });
  }
}
