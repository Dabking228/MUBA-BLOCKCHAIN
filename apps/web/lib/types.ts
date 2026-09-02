// Shared types mirroring the on-chain `disaster_relief::relief_v3` module,
// plus the app's derived/role types and API DTOs.

// ===== On-chain enums =====

export enum Channel {
  PPS = 0,
  CommunityLeader = 1,
  DistrictOffice = 2,
}

export enum RegistrationStatus {
  Pending = 0,
  Verified = 1,
  Rejected = 2,
  Paid = 3,
}

/** Severity tiers — index into a zone's on-chain tier_amounts table. */
export enum Tier {
  Minor = 0,
  Major = 1,
  TotalLoss = 2,
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  [Channel.PPS]: "PPS (evacuation centre)",
  [Channel.CommunityLeader]: "Ketua Kampung",
  [Channel.DistrictOffice]: "District Office",
};

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Pending verification",
  [RegistrationStatus.Verified]: "Verified",
  [RegistrationStatus.Rejected]: "Rejected",
  [RegistrationStatus.Paid]: "Paid",
};

export const TIER_LABELS: Record<Tier, string> = {
  [Tier.Minor]: "Minor damage",
  [Tier.Major]: "Major damage",
  [Tier.TotalLoss]: "Total loss",
};

/** Channels that auto-verify on registration; CommunityLeader requires a separate verifier. */
export const AUTO_VERIFY_CHANNELS: ReadonlySet<Channel> = new Set([
  Channel.PPS,
  Channel.DistrictOffice,
]);

// ===== On-chain object shapes (indexed mirror) =====

export interface DisasterZone {
  id: string; // on-chain object ID
  name: string;
  active: boolean;
  eligiblePostcodes: string[];
  tierAmounts: Record<number, string>; // tier -> fixed amount in MIST (string for bigint safety)
  budgetCap: string; // MIST
  budgetSpent: string; // MIST
  createdAt?: string;
}

export interface HouseholdRegistration {
  id: string;
  headOfHousehold: string | null; // null until claim_and_link
  claimed: boolean;
  householdId: string;
  zoneId: string;
  postcode: string;
  channel: Channel;
  tier: Tier;
  status: RegistrationStatus;
  registrar: string;
  referenceCodeHash?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Donation {
  id?: number;
  treasuryId?: string;
  donorAddress: string;
  amount: string; // MIST
  coinType?: string;
  txDigest: string;
  createdAt: string;
}

export interface AiRecommendation {
  registrationId: string;
  gonkaRequestId: string;
  recommendation: "approve" | "reject" | "needs_review";
  confidence: number; // 0–1
  reasoning: string;
  createdAt: string;
}

// ===== Derived roles (never stored — resolved live per address) =====

export interface ResolvedRoles {
  address: string;
  isAdmin: boolean;
  registrarChannels: Channel[]; // empty if not a registrar
  isVerifier: boolean;
  households: HouseholdRegistration[]; // every registration linked to this address
  hasDonated: boolean;
  donationTotal: string; // MIST
}

export type AppRole = "admin" | "registrar" | "verifier" | "household" | "donor" | "public";

// ===== API DTOs =====

export interface ReferenceCodeResponse {
  code: string; // plaintext — shown once to the official for printing
  codeHash: string; // hex sha3-256, goes on-chain
}

export interface SponsorRequest {
  action: SponsoredAction;
  sender: string;
  params: Record<string, unknown>;
}

export type SponsoredAction =
  | "donate"
  | "register_household"
  | "verify_registration"
  | "reject_registration"
  | "claim_and_link"
  | "release_funds";

export interface SponsorResponse {
  txBytes: string; // base64 TransactionData
  sponsorSignature: string;
}

export interface ExecuteRequest {
  txBytes: string;
  sponsorSignature: string;
  senderSignature: string;
}

export interface ExecuteResponse {
  digest: string;
  success: boolean;
  error?: string;
}

export interface BulkRegisterDraft {
  householdId: string;
  postcode: string;
  tier: Tier;
  damageNotes: string;
  headCount?: number;
  confidence?: number;
}
