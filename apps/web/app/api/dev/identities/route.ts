import { NextResponse } from "next/server";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { publicEnv } from "@/lib/env";

// Dev-mode only. Exposes the throwaway demo official / verifier keypairs created
// by scripts/seed.ts so the login screen can offer one-click role sign-in.
// These addresses only hold capability objects (no funds); disabled outside dev.
export async function GET() {
  if (!publicEnv.showDemoLogins) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const identities: Record<string, { address: string; secretKey: string }> = {};
  for (const [role, key] of [
    ["official", process.env.DEMO_OFFICIAL_KEY],
    ["verifier", process.env.DEMO_VERIFIER_KEY],
  ] as const) {
    if (!key) continue;
    try {
      identities[role] = { address: Ed25519Keypair.fromSecretKey(key).toSuiAddress(), secretKey: key };
    } catch {
      /* skip malformed */
    }
  }
  return NextResponse.json({ identities });
}
