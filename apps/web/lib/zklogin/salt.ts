import "server-only";
import { createHmac } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { publicEnv, serverEnv } from "@/lib/env";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface VerifiedJwt {
  sub: string;
  aud: string;
  iss: string;
  email?: string;
}

/** Verify a Google ID token: signature (JWKS), audience (our client id), expiry. */
export async function verifyGoogleJwt(jwt: string): Promise<VerifiedJwt> {
  const { payload } = await jwtVerify(jwt, GOOGLE_JWKS, {
    audience: publicEnv.googleClientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  if (!payload.sub) throw new Error("JWT missing sub claim");
  return {
    sub: String(payload.sub),
    aud: String(payload.aud),
    iss: String(payload.iss),
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}

/**
 * Deterministic per-user salt derived from a server secret + the OAuth identity.
 * Stable for a given (iss, aud, sub), never stored, not guessable without the secret.
 * A production system would use a dedicated salt service; this is a documented
 * hackathon simplification (Project Guide §13).
 * Returns a decimal string of a value < 2^128 (a valid zkLogin salt field element).
 */
export function deriveSalt(v: VerifiedJwt): string {
  const secret = serverEnv().zkloginSaltSecret;
  const mac = createHmac("sha256", secret).update(`${v.iss}|${v.aud}|${v.sub}`).digest();
  return BigInt("0x" + mac.subarray(0, 16).toString("hex")).toString();
}
