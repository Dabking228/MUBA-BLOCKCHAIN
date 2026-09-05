-- Zone evidence + multi-model GonkaRouter credibility consensus.
-- Purely additive — no existing table/behavior is touched. Safe to run even
-- while the feature is disabled in the app (NEXT_PUBLIC_ENABLE_ZONE_CREDIBILITY).

create table if not exists zone_evidence (
  id             bigserial primary key,
  zone_id        text not null references disaster_zones(id),
  source_type    text not null check (source_type in ('url', 'text')),
  url            text,
  extracted_text text not null default '',
  fetch_status   text not null default 'manual' check (fetch_status in ('ok', 'failed', 'manual')),
  created_at     timestamptz not null default now()
);
create index if not exists idx_zone_evidence_zone on zone_evidence(zone_id);

-- One row per model per credibility-check run (a failed/timed-out model still
-- gets a row with `error` set, so partial failures are auditable, not hidden).
create table if not exists zone_credibility_results (
  id               bigserial primary key,
  zone_id          text not null references disaster_zones(id),
  run_id           uuid not null,
  model            text not null,
  label            text check (label in ('well-supported', 'partially-supported', 'insufficient-evidence', 'inconsistent')),
  score            numeric(5,2),
  summary          text,
  gonka_request_id text,
  error            text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_zone_credibility_zone on zone_credibility_results(zone_id);
create index if not exists idx_zone_credibility_run on zone_credibility_results(run_id);
