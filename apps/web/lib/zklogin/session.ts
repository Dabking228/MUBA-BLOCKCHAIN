"use client";

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { ZkLoginSigner } from "@mysten/sui/zklogin";
import type { ZkLoginSignatureInputs } from "@mysten/sui/zklogin";

const SESSION_KEY = "mysteadyaid.zklogin.session";
const PENDING_KEY = "mysteadyaid.zklogin.pending";

/** Persisted between the OAuth redirect legs. */
export interface PendingLogin {
  ephemeralSecretKey: string;
  maxEpoch: number;
  randomness: string;
  nonce: string;
  state: string;
}

/** A completed zkLogin session — enough to rebuild a signer. */
export interface ZkSession {
  address: string;
  email?: string;
  ephemeralSecretKey: string;
  maxEpoch: number;
  inputs: ZkLoginSignatureInputs;
}

export function savePending(p: PendingLogin) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
}
export function loadPending(): PendingLogin | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  return raw ? (JSON.parse(raw) as PendingLogin) : null;
}
export function clearPending() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function saveZkSession(s: ZkSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function loadZkSession(): ZkSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ZkSession) : null;
  } catch {
    return null;
  }
}
export function clearZkSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Build a ZkLoginSigner from a stored session. Returns null if the proof epoch has passed. */
export function zkSignerFrom(session: ZkSession, currentEpoch: number): ZkLoginSigner | null {
  if (currentEpoch > session.maxEpoch) return null;
  return new ZkLoginSigner({
    ephemeralSigner: Ed25519Keypair.fromSecretKey(session.ephemeralSecretKey),
    maxEpoch: session.maxEpoch,
    inputs: session.inputs,
    legacyAddress: false,
    address: session.address,
  });
}
