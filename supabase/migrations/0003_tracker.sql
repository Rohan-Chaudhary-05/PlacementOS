-- PlacementOS — student Application Tracker.
-- Lets a signed-in student save/track opportunities (real ACCEPTED listings or
-- curated samples) with a server-built snapshot so the tracker renders without
-- joining (samples are not DB rows) and survives later listing edits.
--
-- Run this once in the Supabase SQL editor AFTER 0001 and 0002. Safe to re-run.

create table if not exists public.tracked_opportunities (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references auth.users (id) on delete cascade,
  -- A real opportunity UUID (as text) or a sample ref like 'demo-1'.
  opportunity_ref text not null check (char_length(opportunity_ref) <= 100),
  state           text not null default 'SAVED' check (state in ('SAVED', 'APPLIED')),
  -- Display snapshot (role, companyName, location, sector, salaryMin/Max,
  -- currency, workMode, deadline, applyUrl, isDemo). Built on the server.
  snapshot        jsonb not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (student_id, opportunity_ref)
);

create index if not exists tracked_opportunities_student_id_idx
  on public.tracked_opportunities (student_id);

-- Keep updated_at fresh (function defined in 0001_init.sql).
drop trigger if exists tracked_opportunities_set_updated_at on public.tracked_opportunities;
create trigger tracked_opportunities_set_updated_at
  before update on public.tracked_opportunities
  for each row execute function public.set_updated_at();

-- ───────────────────────────── RLS ─────────────────────────────
-- A student may only ever see or change their own tracked rows. No other role
-- has any access — staff/company never read a student's list.
alter table public.tracked_opportunities enable row level security;

drop policy if exists tracked_select_own on public.tracked_opportunities;
create policy tracked_select_own on public.tracked_opportunities
  for select using (auth.uid() = student_id);

drop policy if exists tracked_insert_own on public.tracked_opportunities;
create policy tracked_insert_own on public.tracked_opportunities
  for insert with check (auth.uid() = student_id);

drop policy if exists tracked_update_own on public.tracked_opportunities;
create policy tracked_update_own on public.tracked_opportunities
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

drop policy if exists tracked_delete_own on public.tracked_opportunities;
create policy tracked_delete_own on public.tracked_opportunities
  for delete using (auth.uid() = student_id);

-- ───────────────────────── API role grants ─────────────────────────
-- (Supabase default privileges did not apply to our tables — see 0001.)
grant select, insert, update, delete on public.tracked_opportunities to authenticated;
grant all on public.tracked_opportunities to service_role;
