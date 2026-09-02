-- Indexer support: resumable cursor + de-dupe keys for idempotent re-scans.
-- Run in the Supabase SQL editor after 0001_init.sql.

create table if not exists indexer_state (
  id         text primary key,
  cursor     text,
  updated_at timestamptz not null default now()
);

-- events_log: make re-scans idempotent.
alter table events_log add column if not exists event_seq text;
create unique index if not exists idx_events_log_seq on events_log (event_seq);

-- donations: one row per Donated event, even across re-scans.
alter table donations add column if not exists event_seq text;
create unique index if not exists idx_donations_seq on donations (event_seq);

-- Payout amount is useful on the registration row for the aid timeline.
alter table household_registrations add column if not exists paid_amount bigint;
alter table household_registrations add column if not exists paid_tx_digest text;
