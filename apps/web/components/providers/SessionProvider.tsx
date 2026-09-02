"use client";

import * as React from "react";
import type { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import type { ResolvedRoles } from "@/lib/types";
import { EMPTY_ROLES, type SessionIdentity } from "@/lib/session/types";
import {
  clearDevKeypair,
  createDevKeypair,
  loadDevKeypair,
  setDevKeypair,
  storedLabel,
} from "@/lib/session/devWallet";
import { shortAddress } from "@/lib/format";

interface SessionContextValue {
  identity: SessionIdentity | null;
  keypair: Ed25519Keypair | null;
  roles: ResolvedRoles | null;
  loading: boolean;
  /** Fresh random dev wallet (a new household / donor). */
  signInNew: () => Promise<void>;
  /** Sign in with a specific secret key (demo official / verifier). */
  signInWithKey: (secretKey: string, label: string) => Promise<void>;
  signOut: () => void;
  refreshRoles: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}

async function fetchRoles(address: string): Promise<ResolvedRoles> {
  try {
    const res = await fetch(`/api/session?address=${address}`, { cache: "no-store" });
    if (!res.ok) return EMPTY_ROLES(address);
    return (await res.json()) as ResolvedRoles;
  } catch {
    return EMPTY_ROLES(address);
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [keypair, setKeypair] = React.useState<Ed25519Keypair | null>(null);
  const [identity, setIdentity] = React.useState<SessionIdentity | null>(null);
  const [roles, setRoles] = React.useState<ResolvedRoles | null>(null);
  const [loading, setLoading] = React.useState(true);

  const activate = React.useCallback(async (kp: Ed25519Keypair, label?: string) => {
    const address = kp.toSuiAddress();
    const next: SessionIdentity = {
      address,
      authMode: "dev",
      label: label ?? shortAddress(address),
    };
    setKeypair(kp);
    setIdentity(next);
    setLoading(true);
    setRoles(await fetchRoles(address));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const kp = loadDevKeypair();
    if (kp) void activate(kp, storedLabel() ?? undefined);
    else setLoading(false);
  }, [activate]);

  const signInNew = React.useCallback(async () => {
    await activate(createDevKeypair());
  }, [activate]);

  const signInWithKey = React.useCallback(
    async (secretKey: string, label: string) => {
      await activate(setDevKeypair(secretKey, label), label);
    },
    [activate],
  );

  const signOut = React.useCallback(() => {
    clearDevKeypair();
    setKeypair(null);
    setIdentity(null);
    setRoles(null);
  }, []);

  const refreshRoles = React.useCallback(async () => {
    if (identity) setRoles(await fetchRoles(identity.address));
  }, [identity]);

  const value: SessionContextValue = {
    identity,
    keypair,
    roles,
    loading,
    signInNew,
    signInWithKey,
    signOut,
    refreshRoles,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
