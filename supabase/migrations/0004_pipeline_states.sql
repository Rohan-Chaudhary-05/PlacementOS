-- PlacementOS — expand the tracker into a full application pipeline.
-- Widens tracked_opportunities.state from SAVED/APPLIED to the five funnel
-- stages so a student can track an application all the way to an outcome.
--
-- Run this once in the Supabase SQL editor AFTER 0003. Safe to re-run.
--
-- The state column's CHECK was declared inline in 0003, so Postgres auto-named
-- it `tracked_opportunities_state_check` (the <table>_<column>_check convention).
-- Confirm the name if a re-add ever fails:
--   select conname from pg_constraint
--   where conrelid = 'public.tracked_opportunities'::regclass and contype = 'c';
--
-- Existing SAVED/APPLIED rows stay valid (both remain in the allow-list); the
-- column default ('SAVED') is unaffected. No data backfill needed.

alter table public.tracked_opportunities
  drop constraint if exists tracked_opportunities_state_check;

alter table public.tracked_opportunities
  add constraint tracked_opportunities_state_check
  check (state in ('SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'));
