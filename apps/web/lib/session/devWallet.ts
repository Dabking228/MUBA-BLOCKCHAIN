"use client";

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// Dev-only stand-in for zkLogin (see Handover §7.4). A testnet keypair is kept
// in localStorage so household / donor / official flows can be exercised before
// real Google zkLogin is wired. Inert when NEXT_PUBLIC_AUTH_MODE !== "dev".

const STORAGE_KEY = "mysteadyaid.dev.secretKey";
const LABEL_KEY = "mysteadyaid.dev.label";

export function devLoginEnabled(): boolean {
  return (process.env.NEXT_PUBLIC_AUTH_MODE ?? "dev") === "dev";
}

export function loadDevKeypair(): Ed25519Keypair | null {
  if (typeof window === "undefined") return null;
  const sk = window.localStorage.getItem(STORAGE_KEY);
  if (!sk) return null;
  try {
    return Ed25519Keypair.fromSecretKey(sk);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storedLabel(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LABEL_KEY);
}

export function setDevKeypair(secretKey: string, label?: string): Ed25519Keypair {
  const kp = Ed25519Keypair.fromSecretKey(secretKey);
  window.localStorage.setItem(STORAGE_KEY, secretKey);
  if (label) window.localStorage.setItem(LABEL_KEY, label);
  else window.localStorage.removeItem(LABEL_KEY);
  return kp;
}

export function createDevKeypair(): Ed25519Keypair {
  const kp = Ed25519Keypair.generate();
  window.localStorage.setItem(STORAGE_KEY, kp.getSecretKey());
  window.localStorage.removeItem(LABEL_KEY);
  return kp;
}

export function clearDevKeypair(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LABEL_KEY);
}
