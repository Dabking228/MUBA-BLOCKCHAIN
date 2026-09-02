// Row shapes for the Supabase read-mirror tables (supabase/0001_init.sql).

export interface DisasterZoneRow {
  id: string;
  name: string;
  active: boolean;
  eligible_postcodes: string[];
  tier_amounts: Record<string, number | string>;
  budget_cap: string;
  budget_spent: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdRegistrationRow {
  id: string;
  household_id: string;
  zone_id: string;
  postcode: string;
  channel: number;
  tier: number;
  status: number;
  registrar_address: string;
  head_of_household: string | null;
  claimed: boolean;
  reference_code_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DonationRow {
  id: number;
  treasury_id: string;
  donor_address: string;
  amount: string;
  coin_type: string;
  tx_digest: string;
  created_at: string;
}

export interface AiRecommendationRow {
  id: number;
  registration_id: string;
  gonka_request_id: string;
  recommendation: "approve" | "reject" | "needs_review";
  confidence: number | null;
  reasoning: string | null;
  created_at: string;
}

export interface EventLogRow {
  id: number;
  event_type: string;
  object_id: string | null;
  tx_digest: string;
  raw_payload: unknown;
  created_at: string;
}
