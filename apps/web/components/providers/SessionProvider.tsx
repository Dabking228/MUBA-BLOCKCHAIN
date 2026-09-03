"use client";

import * as React from "react";
import type { Signer } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import type { ResolvedRoles } from "@/lib/types";
import { EMPTY_ROLES, type SessionIdentity } from "@/lib/session/types";
import {
  clearDevKeypair,
  createDevKeypair,
  loadDevKeypair,
  setDevKeypair,
  storedLabel,
} from "@/lib/session/devWallet";
import {
  clearZkSession,
  loadZkSession,
  zkSignerFrom,
  type ZkSession,
} from "@/lib/zklogin/session";
import { beginGoogleLogin } from "@/lib/zklogin/oauth";
import { shortAddress } from "@/lib/format";

interface SessionContextValue {
  identity: SessionIdentity | null;
  signer: Signer | null;
  roles: ResolvedRoles | null;
  loading: boolean;
  signInNew: () => Promise<void>;
  signInWithKey: (secretKey: string, label: string) => Promise<void>;
  signInGoogle: (next?: string) => Promise<void>;
  activateZkSession: (session: ZkSession) => Promise<void>;
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

async function currentEpoch(): Promise<number> {
  try {
    const { epoch } = await fetch("/api/epoch", { cache: "no-store" }).then((r) => r.json());
    return Number(epoch);
  } catch {
    return 0;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [signer, setSigner] = React.useState<Signer | null>(null);
  const [identity, setIdentity] = React.useState<SessionIdentity | null>(null);
  const [roles, setRoles] = React.useState<ResolvedRoles | null>(null);
  const [loading, setLoading] = React.useState(true);

  const activate = React.useCallback(
    async (nextSigner: Signer, id: SessionIdentity) => {
      setSigner(nextSigner);
      setIdentity(id);
      setLoading(true);
      setRoles(await fetchRoles(id.address));
      setLoading(false);
    },
    [],
  );

  const activateZkSession = React.useCallback(
    async (session: ZkSession) => {
      const zk = zkSignerFrom(session, await currentEpoch());
      if (!zk) {
        clearZkSession();
        throw new Error("Your sign-in has expired. Please sign in again.");
      }
      await activate(zk, {
        address: session.address,
        authMode: "google",
        label: session.email ?? shortAddress(session.address),
      });
    },
    [activate],
  );

  // Restore a session on first mount — zkLogin takes precedence over a dev key.
  React.useEffect(() => {
    const zk = loadZkSession();
    if (zk) {
      activateZkSession(zk).catch(() => setLoading(false));
      return;
    }
    const kp = loadDevKeypair();
    if (kp) {
      void activate(kp, {
        address: kp.toSuiAddress(),
        authMode: "dev",
        label: storedLabel() ?? shortAddress(kp.toSuiAddress()),
      });
    } else {
      setLoading(false);
    }
  }, [activate, activateZkSession]);

  const signInNew = React.useCallback(async () => {
    const kp = createDevKeypair();
    await activate(kp, { address: kp.toSuiAddress(), authMode: "dev", label: shortAddress(kp.toSuiAddress()) });
  }, [activate]);

  const signInWithKey = React.useCallback(
    async (secretKey: string, label: string) => {
      const kp = setDevKeypair(secretKey, label);
      await activate(kp, { address: kp.toSuiAddress(), authMode: "dev", label });
    },
    [activate],
  );

  const signInGoogle = React.useCallback(async (next = "/home") => {
    await beginGoogleLogin(next);
  }, []);

  const signOut = React.useCallback(() => {
    clearDevKeypair();
    clearZkSession();
    setSigner(null);
    setIdentity(null);
    setRoles(null);
  }, []);

  const refreshRoles = React.useCallback(async () => {
    if (identity) setRoles(await fetchRoles(identity.address));
  }, [identity]);

  const value: SessionContextValue = {
    identity,
    signer,
    roles,
    loading,
    signInNew,
    signInWithKey,
    signInGoogle,
    activateZkSession,
    signOut,
    refreshRoles,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Type guard used by flows that still special-case a raw keypair (none currently). */
export function isKeypair(s: Signer | null): s is Ed25519Keypair {
  return s instanceof Ed25519Keypair;
}
