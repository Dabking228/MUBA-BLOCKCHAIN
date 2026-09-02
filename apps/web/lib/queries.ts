import "server-only";
import { serviceClient } from "@/lib/supabase/admin";
import { readTreasuryBalance } from "@/lib/sui/read";
import { rowToDonation, rowToRegistration, rowToZone } from "@/lib/mappers";
import { RegistrationStatus } from "@/lib/types";
import type {
  DisasterZoneRow,
  DonationRow,
  HouseholdRegistrationRow,
} from "@/lib/supabase/rows";
import type { Donation, HouseholdRegistration, DisasterZone } from "@/lib/types";

export interface DashboardData {
  treasuryBalance: string;
  totalDonated: string;
  zones: DisasterZone[];
  pipeline: Record<"pending" | "verified" | "rejected" | "paid" | "total", number>;
  recentDonations: Donation[];
  recentPayouts: (HouseholdRegistration & { paidAmount?: string })[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const sb = serviceClient();

  const [zonesRes, donationsRes, regsRes, treasuryBalance] = await Promise.all([
    sb.from("disaster_zones").select("*").order("created_at", { ascending: true }),
    sb.from("donations").select("*").order("created_at", { ascending: false }).limit(10),
    sb.from("household_registrations").select("*").order("updated_at", { ascending: false }),
    readTreasuryBalance(),
  ]);

  const zones = ((zonesRes.data ?? []) as DisasterZoneRow[]).map(rowToZone);
  const donations = ((donationsRes.data ?? []) as DonationRow[]).map(rowToDonation);
  const regs = ((regsRes.data ?? []) as (HouseholdRegistrationRow & { paid_amount?: number })[]);

  const totalDonated = donations.length
    ? (await sb.from("donations").select("amount")).data?.reduce(
        (s: bigint, d: { amount: string | number }) => s + BigInt(d.amount ?? 0),
        0n,
      ) ?? 0n
    : 0n;

  const pipeline = {
    pending: 0,
    verified: 0,
    rejected: 0,
    paid: 0,
    total: regs.length,
  };
  for (const r of regs) {
    if (r.status === RegistrationStatus.Pending) pipeline.pending++;
    else if (r.status === RegistrationStatus.Verified) pipeline.verified++;
    else if (r.status === RegistrationStatus.Rejected) pipeline.rejected++;
    else if (r.status === RegistrationStatus.Paid) pipeline.paid++;
  }

  const recentPayouts = regs
    .filter((r) => r.status === RegistrationStatus.Paid)
    .slice(0, 8)
    .map((r) => ({
      ...rowToRegistration(r),
      paidAmount: r.paid_amount != null ? String(r.paid_amount) : undefined,
    }));

  return {
    treasuryBalance,
    totalDonated: totalDonated.toString(),
    zones,
    pipeline,
    recentDonations: donations,
    recentPayouts,
  };
}

export async function getRegistrationByCodeHash(
  hashHex: string,
): Promise<HouseholdRegistration | null> {
  const sb = serviceClient();
  const { data } = await sb
    .from("household_registrations")
    .select("*")
    .eq("reference_code_hash", hashHex)
    .maybeSingle();
  return data ? rowToRegistration(data as HouseholdRegistrationRow) : null;
}

export async function getRegistrationsForRegistrar(
  address: string,
): Promise<HouseholdRegistration[]> {
  const sb = serviceClient();
  const { data } = await sb
    .from("household_registrations")
    .select("*")
    .eq("registrar_address", address)
    .order("created_at", { ascending: false });
  return ((data ?? []) as HouseholdRegistrationRow[]).map(rowToRegistration);
}

export async function getPendingRegistrations(): Promise<HouseholdRegistration[]> {
  const sb = serviceClient();
  const { data } = await sb
    .from("household_registrations")
    .select("*")
    .eq("status", RegistrationStatus.Pending)
    .order("created_at", { ascending: true });
  return ((data ?? []) as HouseholdRegistrationRow[]).map(rowToRegistration);
}

export async function getZones(): Promise<DisasterZone[]> {
  const sb = serviceClient();
  const { data } = await sb.from("disaster_zones").select("*").order("created_at", { ascending: true });
  return ((data ?? []) as DisasterZoneRow[]).map(rowToZone);
}

export async function getDonationsForAddress(address: string): Promise<Donation[]> {
  const sb = serviceClient();
  const { data } = await sb
    .from("donations")
    .select("*")
    .eq("donor_address", address)
    .order("created_at", { ascending: false });
  return ((data ?? []) as DonationRow[]).map(rowToDonation);
}

export interface TransparencySummary {
  treasuryBalance: string;
  totalDonated: string;
  zones: DisasterZone[];
  pipeline: DashboardData["pipeline"];
}

/** Compact figures shared by the public dashboard and the combined home view. */
export async function getTransparencySummary(): Promise<TransparencySummary> {
  const d = await getDashboardData();
  return {
    treasuryBalance: d.treasuryBalance,
    totalDonated: d.totalDonated,
    zones: d.zones,
    pipeline: d.pipeline,
  };
}
