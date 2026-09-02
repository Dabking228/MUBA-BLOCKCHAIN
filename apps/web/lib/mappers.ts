import type {
  DisasterZoneRow,
  DonationRow,
  HouseholdRegistrationRow,
} from "@/lib/supabase/rows";
import {
  type Channel,
  type Donation,
  type DisasterZone,
  type HouseholdRegistration,
  type RegistrationStatus,
  type Tier,
} from "@/lib/types";

export function rowToRegistration(r: HouseholdRegistrationRow): HouseholdRegistration {
  return {
    id: r.id,
    headOfHousehold: r.head_of_household,
    claimed: r.claimed,
    householdId: r.household_id,
    zoneId: r.zone_id,
    postcode: r.postcode,
    channel: r.channel as Channel,
    tier: r.tier as Tier,
    status: r.status as RegistrationStatus,
    registrar: r.registrar_address,
    referenceCodeHash: r.reference_code_hash,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToZone(r: DisasterZoneRow): DisasterZone {
  const tierAmounts: Record<number, string> = {};
  for (const [k, v] of Object.entries(r.tier_amounts ?? {})) tierAmounts[Number(k)] = String(v);
  return {
    id: r.id,
    name: r.name,
    active: r.active,
    eligiblePostcodes: r.eligible_postcodes ?? [],
    tierAmounts,
    budgetCap: String(r.budget_cap),
    budgetSpent: String(r.budget_spent),
    createdAt: r.created_at,
  };
}

export function rowToDonation(r: DonationRow): Donation {
  return {
    id: r.id,
    treasuryId: r.treasury_id,
    donorAddress: r.donor_address,
    amount: String(r.amount),
    coinType: r.coin_type,
    txDigest: r.tx_digest,
    createdAt: r.created_at,
  };
}
