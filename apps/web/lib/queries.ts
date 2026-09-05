import "server-only";
import { serviceClient } from "@/lib/supabase/admin";
import { readTreasuryBalance } from "@/lib/sui/read";
import { rowToDonation, rowToRegistration, rowToZone, rowToZoneEvidence } from "@/lib/mappers";
import { resolveZoneCredibilityConsensus } from "@/lib/gonka/consensus";
import { RegistrationStatus } from "@/lib/types";
import type {
  DisasterZoneRow,
  DonationRow,
  HouseholdRegistrationRow,
  ZoneCredibilityResultRow,
  ZoneEvidenceRow,
} from "@/lib/supabase/rows";
import type {
  Donation,
  HouseholdRegistration,
  DisasterZone,
  ModelCredibilityResult,
  ZoneCredibilityRun,
  ZoneEvidenceItem,
} from "@/lib/types";

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

// ===== Zone credibility (multi-model GonkaRouter consensus) =====

export async function getZoneEvidence(zoneId: string): Promise<ZoneEvidenceItem[]> {
  const sb = serviceClient();
  const { data } = await sb
    .from("zone_evidence")
    .select("*")
    .eq("zone_id", zoneId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as ZoneEvidenceRow[]).map(rowToZoneEvidence);
}

function rowsToPerModel(rows: ZoneCredibilityResultRow[]): ModelCredibilityResult[] {
  return rows.map((r) => ({
    model: r.model,
    ok: !r.error && !!r.label,
    label: r.label ?? undefined,
    score: r.score ?? undefined,
    summary: r.summary ?? undefined,
    gonkaRequestId: r.gonka_request_id ?? undefined,
    error: r.error ?? undefined,
  }));
}

/** The most recent credibility-check run for one zone (or an empty "none" run). */
export async function getZoneCredibility(zoneId: string): Promise<ZoneCredibilityRun> {
  const sb = serviceClient();
  const { data: latest } = await sb
    .from("zone_credibility_results")
    .select("run_id, created_at")
    .eq("zone_id", zoneId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return {
      zoneId,
      runId: null,
      consensus: { label: null, score: null, respondedCount: 0, totalModels: 0, agreement: "none" },
      perModel: [],
    };
  }

  const { data: rows } = await sb
    .from("zone_credibility_results")
    .select("*")
    .eq("run_id", latest.run_id);
  const perModel = rowsToPerModel((rows ?? []) as ZoneCredibilityResultRow[]);
  return {
    zoneId,
    runId: latest.run_id,
    consensus: resolveZoneCredibilityConsensus(perModel),
    perModel,
    createdAt: latest.created_at,
  };
}

/** The latest run per zone, for several zones in one query (used by the public dashboard). */
export async function getZoneCredibilitySummaries(
  zoneIds: string[],
): Promise<Record<string, ZoneCredibilityRun>> {
  if (zoneIds.length === 0) return {};
  const sb = serviceClient();
  const { data } = await sb
    .from("zone_credibility_results")
    .select("*")
    .in("zone_id", zoneIds)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as ZoneCredibilityResultRow[];

  const latestRunByZone = new Map<string, string>();
  for (const r of rows) {
    if (!latestRunByZone.has(r.zone_id)) latestRunByZone.set(r.zone_id, r.run_id);
  }

  const result: Record<string, ZoneCredibilityRun> = {};
  for (const [zoneId, runId] of latestRunByZone) {
    const runRows = rows.filter((r) => r.zone_id === zoneId && r.run_id === runId);
    const perModel = rowsToPerModel(runRows);
    result[zoneId] = { zoneId, runId, consensus: resolveZoneCredibilityConsensus(perModel), perModel };
  }
  return result;
}
