import "server-only";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { serverEnv } from "@/lib/env";

let sponsor: Ed25519Keypair | null = null;
let admin: Ed25519Keypair | null = null;

/** Sponsor keypair — pays gas for every user transaction. Server only. */
export function sponsorKeypair(): Ed25519Keypair {
  if (!sponsor) sponsor = Ed25519Keypair.fromSecretKey(serverEnv().sponsorPrivateKey);
  return sponsor;
}

/** Admin keypair — owns AdminCap; issues zones/caps and funds the treasury. Server only. */
export function adminKeypair(): Ed25519Keypair {
  if (!admin) admin = Ed25519Keypair.fromSecretKey(serverEnv().adminPrivateKey);
  return admin;
}

export function sponsorAddress(): string {
  return sponsorKeypair().toSuiAddress();
}

export function adminAddress(): string {
  return adminKeypair().toSuiAddress();
}
