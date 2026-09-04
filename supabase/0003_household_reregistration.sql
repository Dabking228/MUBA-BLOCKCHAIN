-- Fix: a household can legitimately have more than one registration row over
-- time (rejected, then re-registered — Handover §9.4, contract releases the
-- household_id lock on rejection). The original unique index on household_id
-- alone blocked the indexer from ever inserting the re-registration's row,
-- which silently failed (logged, not surfaced) and left the new reference
-- code unusable — a lookup at claim time found nothing.
--
-- Replace it with a *partial* unique index: at most one non-rejected row per
-- household_id at a time (status 2 = Rejected), matching what the contract
-- itself enforces on-chain via HouseholdRegistry.

drop index if exists idx_household_unique;

create unique index if not exists idx_household_unique_active
  on household_registrations (household_id)
  where status <> 2;
