import type { ResolvedRoles } from "@/lib/types";

export type AuthMode = "dev" | "google";

export interface SessionIdentity {
  address: string;
  authMode: AuthMode;
  /** Human label for the signed-in identity (email for google, short address for dev). */
  label: string;
}

export interface SessionState {
  identity: SessionIdentity | null;
  roles: ResolvedRoles | null;
  loading: boolean;
}

export const EMPTY_ROLES = (address: string): ResolvedRoles => ({
  address,
  isAdmin: false,
  registrarChannels: [],
  isVerifier: false,
  households: [],
  hasDonated: false,
  donationTotal: "0",
});
