-- PlacementOS — per-student match profile.
-- Stores the preferences a student fills in (discipline, skills, target sectors,
-- work modes, locations, salary floor) that power the personalised opportunity
-- match score. Kept in a SEPARATE table from public.profiles so a student can
-- self-edit these fields without ever being granted write access to their
-- `role` (which must stay immutable).
--
-- Run this once in the Supabase SQL editor AFTER 0005. Safe to re-run.

create table if not exists public.student_profiles (
  student_id          uuid primary key references auth.users (id) on delete cascade,
  discipline          text    check (discipline is null or char_length(discipline) <= 120),
  study_year          text    check (study_year is null or char_length(study_year) <= 40),
  -- Comma / newline separated skills, parsed client + server side.
  skills              text    check (skills is null or char_length(skills) <= 2000),
  target_sectors      text[]  not null default '{}',
  work_modes          text[]  not null default '{}',
  preferred_locations text    check (preferred_locations is null or char_length(preferred_locations) <= 500),
  min_salary          integer check (min_salary is null or (min_salary >= 0 and min_salary <= 100000000)),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Keep updated_at fresh (function defined in 0001_init.sql).
drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

-- ───────────────────────────── RLS ─────────────────────────────
-- A student may only ever see or change their own profile row. No other role
-- has any access.
alter table public.student_profiles enable row level security;

drop policy if exists student_profiles_select_own on public.student_profiles;
create policy student_profiles_select_own on public.student_profiles
  for select using (auth.uid() = student_id);

drop policy if exists student_profiles_insert_own on public.student_profiles;
create policy student_profiles_insert_own on public.student_profiles
  for insert with check (auth.uid() = student_id);

drop policy if exists student_profiles_update_own on public.student_profiles;
create policy student_profiles_update_own on public.student_profiles
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

drop policy if exists student_profiles_delete_own on public.student_profiles;
create policy student_profiles_delete_own on public.student_profiles
  for delete using (auth.uid() = student_id);

-- ───────────────────────── API role grants ─────────────────────────
-- (Supabase default privileges did not apply to our tables — see 0001.)
grant select, insert, update, delete on public.student_profiles to authenticated;
grant all on public.student_profiles to service_role;
