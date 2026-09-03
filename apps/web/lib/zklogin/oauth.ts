"use client";

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  decodeJwt,
  genAddressSeed,
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import type { ZkLoginSignatureInputs } from "@mysten/sui/zklogin";
import { publicEnv } from "@/lib/env";
import {
  clearPending,
  loadPending,
  savePending,
  saveZkSession,
  type ZkSession,
} from "@/lib/zklogin/session";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";

function redirectUri() {
  return `${window.location.origin}/auth/callback`;
}

async function currentEpoch(): Promise<number> {
  const res = await fetch("/api/epoch", { cache: "no-store" });
  const { epoch } = await res.json();
  return Number(epoch);
}

/** Leg 1: mint an ephemeral key + nonce, then hand off to Google. */
export async function beginGoogleLogin(next = "/home"): Promise<void> {
  const ephemeral = Ed25519Keypair.generate();
  const epoch = await currentEpoch();
  const maxEpoch = epoch + (publicEnv.zkloginMaxEpochOffset || 10);
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeral.getPublicKey(), maxEpoch, randomness);
  const state = crypto.randomUUID();

  savePending({
    ephemeralSecretKey: ephemeral.getSecretKey(),
    maxEpoch,
    randomness,
    nonce,
    state,
  });
  sessionStorage.setItem("mysteadyaid.zklogin.next", next);

  const params = new URLSearchParams({
    client_id: publicEnv.googleClientId,
    redirect_uri: redirectUri(),
    response_type: "id_token",
    scope: "openid email",
    nonce,
    state,
    prompt: "select_account",
  });
  window.location.href = `${GOOGLE_AUTH}?${params.toString()}`;
}

export interface LoginProgress {
  step: "verifying" | "salt" | "proving" | "done" | "error";
  message?: string;
}

/** Leg 2 (on /auth/callback): turn the id_token into a usable zkLogin session. */
export async function completeGoogleLogin(
  hash: string,
  onProgress?: (p: LoginProgress) => void,
): Promise<{ session: ZkSession; next: string }> {
  const frag = new URLSearchParams(hash.replace(/^#/, ""));
  const idToken = frag.get("id_token");
  const returnedState = frag.get("state");
  const err = frag.get("error");
  if (err) throw new Error(`Google sign-in was cancelled (${err}).`);
  if (!idToken) throw new Error("No id_token returned from Google.");

  const pending = loadPending();
  if (!pending) throw new Error("Login session expired. Please try again.");
  if (returnedState && returnedState !== pending.state) {
    throw new Error("State mismatch — aborting for safety.");
  }

  onProgress?.({ step: "verifying" });
  const decoded = decodeJwt(idToken);
  if (decoded.aud !== publicEnv.googleClientId) {
    throw new Error("Token audience does not match this app.");
  }
  const tokenNonce = (decoded as { nonce?: unknown }).nonce;
  if (typeof tokenNonce === "string" && tokenNonce !== pending.nonce) {
    throw new Error("Nonce mismatch — aborting for safety.");
  }

  onProgress?.({ step: "salt" });
  const saltRes = await fetch("/api/zklogin/salt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jwt: idToken }),
  });
  const saltJson = await saltRes.json();
  if (!saltRes.ok) throw new Error(saltJson.error ?? "Could not derive account salt.");
  const salt: string = saltJson.salt;
  const email: string | undefined = saltJson.email;

  const address = jwtToAddress(idToken, salt, false);

  onProgress?.({ step: "proving" });
  const ephemeral = Ed25519Keypair.fromSecretKey(pending.ephemeralSecretKey);
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeral.getPublicKey());

  const proveRes = await fetch("/api/zklogin/prove", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jwt: idToken,
      extendedEphemeralPublicKey,
      maxEpoch: pending.maxEpoch,
      jwtRandomness: pending.randomness,
      salt,
      keyClaimName: "sub",
    }),
  });
  const proof = await proveRes.json();
  if (!proveRes.ok) throw new Error(proof.error ?? "The zkLogin prover request failed.");

  const addressSeed = genAddressSeed(BigInt(salt), "sub", decoded.sub, decoded.aud).toString();
  const inputs = { ...proof, addressSeed } as ZkLoginSignatureInputs;

  const session: ZkSession = {
    address,
    email,
    ephemeralSecretKey: pending.ephemeralSecretKey,
    maxEpoch: pending.maxEpoch,
    inputs,
  };
  saveZkSession(session);
  clearPending();

  const next = sessionStorage.getItem("mysteadyaid.zklogin.next") || "/home";
  sessionStorage.removeItem("mysteadyaid.zklogin.next");
  onProgress?.({ step: "done" });
  return { session, next };
}
