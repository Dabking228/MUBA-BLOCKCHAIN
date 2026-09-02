create table disaster_zones (
  id                 text primary key,          -- on-chain object ID
  name               text not null,
  active             boolean not null default true,
  eligible_postcodes text[] not null default '{}',
  tier_amounts       jsonb not null default '{}', -- { "0": 500000000, "1": 2000000000, ... }
  budget_cap         bigint not null,
  budget_spent       bigint not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table household_registrations (
  id                   text primary key,        -- on-chain object ID
  household_id         text not null,
  zone_id              text not null references disaster_zones(id),
  postcode             text not null,
  channel              smallint not null,
  tier                 smallint not null,
  status               smallint not null,
  registrar_address    text not null,
  head_of_household     text,                    -- null until claimed
  claimed              boolean not null default false,
  reference_code_hash  text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index idx_household_unique on household_registrations(household_id);
create index idx_registrations_zone on household_registrations(zone_id);
create index idx_registrations_status on household_registrations(status);

create table donations (
  id            bigserial primary key,
  treasury_id   text not null,
  donor_address text not null,
  amount        bigint not null,
  coin_type     text not null default 'SUI',
  tx_digest     text not null,
  created_at    timestamptz not null default now()
);

create table ai_recommendations (
  id                bigserial primary key,
  registration_id   text not null references household_registrations(id),
  gonka_request_id  text not null,
  recommendation    text not null check (recommendation in ('approve', 'reject', 'needs_review')),
  confidence         numeric(4,3),
  reasoning         text,
  created_at        timestamptz not null default now()
);

-- Optional display metadata only — NEVER used to grant or check permissions.
-- Roles are resolved live per Section 4.1, not read from this table.
create table user_profiles (
  address       text primary key,
  display_name  text,
  organization  text,
  created_at    timestamptz not null default now()
);

-- Raw event mirror, useful for debugging/audit beyond the typed tables above
create table events_log (
  id            bigserial primary key,
  event_type    text not null,
  object_id     text,
  tx_digest     text not null,
  raw_payload   jsonb not null,
  created_at    timestamptz not null default now()
);

create index idx_events_log_type on events_log(event_type);