import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/supabase/admin";
import { getSuiClient } from "@/lib/sui/client";
import { EVENT, MODULE, PACKAGE_ID, TREASURY_ID } from "@/lib/sui/constants";
import { readRegistration, readZone } from "@/lib/sui/read";

const CURSOR_ID = "relief";
const MODULE_FILTER = `${PACKAGE_ID}::${MODULE}`;

let running: Promise<IndexerResult> | null = null;

export interface IndexerResult {
  processed: number;
  cursor: string | null;
  zonesRefreshed: number;
}

/** Idempotent: safe to call on every mutation and from the cron. De-duped so
 *  overlapping calls share one run. */
export function runIndexer(): Promise<IndexerResult> {
  if (!running) {
    running = doRun().finally(() => {
      running = null;
    });
  }
  return running;
}

async function loadCursor(sb: SupabaseClient): Promise<string | null> {
  try {
    const { data } = await sb.from("indexer_state").select("cursor").eq("id", CURSOR_ID).maybeSingle();
    return data?.cursor ?? null;
  } catch {
    return null;
  }
}

async function saveCursor(sb: SupabaseClient, cursor: string | null) {
  if (!cursor) return;
  try {
    await sb
      .from("indexer_state")
      .upsert({ id: CURSOR_ID, cursor, updated_at: new Date().toISOString() });
  } catch {
    /* indexer_state table not migrated yet — full re-scan next run */
  }
}

async function doRun(): Promise<IndexerResult> {
  const sb = serviceClient();
  const client = getSuiClient();

  let cursor = await loadCursor(sb);
  let processed = 0;
  const touchedRegistrations = new Set<string>();
  let sawAidPaid = false;

  for (let guard = 0; guard < 50; guard++) {
    const page = await client.listEvents({
      filter: { eventType: MODULE_FILTER },
      after: cursor,
      order: "ascending",
      limit: 50,
    });

    for (const ev of page.events) {
      const seq = `${ev.transactionDigest}:${ev.eventIndex}`;
      await logRaw(sb, ev.eventType, seq, ev.transactionDigest, ev.json);

      const data = (ev.json ?? {}) as Record<string, unknown>;
      switch (ev.eventType) {
        case EVENT.Donated:
          await upsertDonation(sb, seq, ev.transactionDigest, data);
          break;
        case EVENT.RegistrationSubmitted:
        case EVENT.RegistrationVerified:
        case EVENT.RegistrationRejected:
        case EVENT.HouseholdLinked:
          if (data.registration_id) touchedRegistrations.add(String(data.registration_id));
          break;
        case EVENT.AidPaid:
          if (data.registration_id) touchedRegistrations.add(String(data.registration_id));
          sawAidPaid = true;
          await recordPayout(sb, String(data.registration_id), data, ev.transactionDigest);
          break;
      }
      processed++;
    }

    if (page.events.length > 0) {
      cursor = page.endCursor;
      await saveCursor(sb, cursor);
    }
    if (!page.hasNextPage) break;
  }

  // Re-read each touched registration from chain → authoritative mirror row.
  for (const id of touchedRegistrations) {
    await syncRegistration(sb, id);
  }

  // Zones have no events; refresh mutable fields for every known zone.
  const zonesRefreshed = await refreshZones(sb, sawAidPaid || touchedRegistrations.size > 0);

  return { processed, cursor, zonesRefreshed };
}

async function logRaw(
  sb: SupabaseClient,
  eventType: string,
  seq: string,
  txDigest: string,
  payload: unknown,
) {
  try {
    await sb
      .from("events_log")
      .upsert(
        { event_type: eventType, event_seq: seq, tx_digest: txDigest, raw_payload: payload ?? {} },
        { onConflict: "event_seq", ignoreDuplicates: true },
      );
  } catch {
    /* events_log.event_seq not migrated — skip raw log */
  }
}

async function upsertDonation(
  sb: SupabaseClient,
  seq: string,
  txDigest: string,
  data: Record<string, unknown>,
) {
  const row = {
    event_seq: seq,
    treasury_id: TREASURY_ID,
    donor_address: String(data.donor ?? ""),
    amount: String(data.amount ?? "0"),
    coin_type: "SUI",
    tx_digest: txDigest,
  };
  const { error } = await sb
    .from("donations")
    .upsert(row, { onConflict: "event_seq", ignoreDuplicates: true });
  if (error && !/duplicate|conflict|event_seq/i.test(error.message)) {
    // event_seq column missing → fall back to a plain insert guarded by tx match
    const { data: existing } = await sb
      .from("donations")
      .select("id")
      .eq("tx_digest", txDigest)
      .eq("amount", row.amount)
      .maybeSingle();
    if (!existing) await sb.from("donations").insert({ ...row, event_seq: undefined });
  }
}

async function syncRegistration(sb: SupabaseClient, id: string) {
  const r = await readRegistration(id);
  if (!r) return;
  const { error } = await sb.from("household_registrations").upsert({
    id: r.id,
    household_id: r.householdId,
    zone_id: r.zoneId,
    postcode: r.postcode,
    channel: r.channel,
    tier: r.tier,
    status: r.status,
    registrar_address: r.registrar,
    head_of_household: r.headOfHousehold,
    claimed: r.claimed,
    reference_code_hash: r.referenceCodeHashHex,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("indexer syncRegistration:", id, error.message);
}

async function recordPayout(
  sb: SupabaseClient,
  registrationId: string,
  data: Record<string, unknown>,
  txDigest: string,
) {
  try {
    await sb
      .from("household_registrations")
      .update({ paid_amount: Number(data.amount ?? 0), paid_tx_digest: txDigest })
      .eq("id", registrationId);
  } catch {
    /* paid_amount column not migrated */
  }
}

async function refreshZones(sb: SupabaseClient, force: boolean): Promise<number> {
  const { data: zones } = await sb.from("disaster_zones").select("id");
  if (!zones?.length) return 0;
  let n = 0;
  for (const { id } of zones) {
    const z = await readZone(id);
    if (!z) continue;
    await sb
      .from("disaster_zones")
      .update({
        name: z.name,
        active: z.active,
        eligible_postcodes: z.eligiblePostcodes,
        budget_cap: z.budgetCap,
        budget_spent: z.budgetSpent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    n++;
  }
  void force;
  return n;
}
