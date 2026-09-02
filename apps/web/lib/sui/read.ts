import { getSuiClient } from "@/lib/sui/client";
import { TREASURY_ID } from "@/lib/sui/constants";

export interface OnChainRegistration {
  id: string;
  headOfHousehold: string | null;
  claimed: boolean;
  householdId: string;
  zoneId: string;
  postcode: string;
  channel: number;
  tier: number;
  status: number;
  registrar: string;
  referenceCodeHashHex: string;
}

function toHex(v: unknown): string {
  if (typeof v === "string") return v.startsWith("0x") ? v.slice(2) : v;
  if (Array.isArray(v)) return v.map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  return "";
}

function optionAddress(v: unknown): string | null {
  // Move Option<address> serializes as the value directly, [] / null when None,
  // or { fields: { vec: [addr] } } / { vec: [...] } depending on transport.
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.length ? String(v[0]) : null;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const vec = (o.vec ?? (o.fields as Record<string, unknown> | undefined)?.vec) as unknown;
    if (Array.isArray(vec)) return vec.length ? String(vec[0]) : null;
  }
  return null;
}

/** Read and normalise a HouseholdRegistration shared object. */
export async function readRegistration(id: string): Promise<OnChainRegistration | null> {
  const client = getSuiClient();
  let json: Record<string, unknown>;
  try {
    const { object } = await client.getObject({ objectId: id, include: { json: true } });
    json = (object.json ?? {}) as Record<string, unknown>;
  } catch {
    return null;
  }
  return {
    id,
    headOfHousehold: optionAddress(json.head_of_household),
    claimed: Boolean(json.claimed),
    householdId: String(json.household_id ?? ""),
    zoneId: String(json.zone_id ?? ""),
    postcode: String(json.postcode ?? ""),
    channel: Number(json.channel ?? 0),
    tier: Number(json.tier ?? 0),
    status: Number(json.status ?? 0),
    registrar: String(json.registrar ?? ""),
    referenceCodeHashHex: toHex(json.reference_code_hash),
  };
}

export interface OnChainZone {
  id: string;
  name: string;
  active: boolean;
  eligiblePostcodes: string[];
  budgetCap: string;
  budgetSpent: string;
}

export async function readZone(id: string): Promise<OnChainZone | null> {
  const client = getSuiClient();
  try {
    const { object } = await client.getObject({ objectId: id, include: { json: true } });
    const j = (object.json ?? {}) as Record<string, unknown>;
    return {
      id,
      name: String(j.name ?? ""),
      active: Boolean(j.active),
      eligiblePostcodes: Array.isArray(j.eligible_postcodes)
        ? (j.eligible_postcodes as unknown[]).map(String)
        : [],
      budgetCap: String(j.budget_cap ?? "0"),
      budgetSpent: String(j.budget_spent ?? "0"),
    };
  } catch {
    return null;
  }
}

/** Live treasury balance in MIST. */
export async function readTreasuryBalance(treasuryId = TREASURY_ID): Promise<string> {
  const client = getSuiClient();
  try {
    const { object } = await client.getObject({ objectId: treasuryId, include: { json: true } });
    const j = (object.json ?? {}) as Record<string, unknown>;
    return String(j.balance ?? "0");
  } catch {
    return "0";
  }
}

/** Live SUI balance for any address (MIST, decimal string). */
export async function readAddressBalance(owner: string): Promise<string> {
  try {
    const { balance } = await getSuiClient().getBalance({ owner, coinType: "0x2::sui::SUI" });
    return balance.balance;
  } catch {
    return "0";
  }
}
