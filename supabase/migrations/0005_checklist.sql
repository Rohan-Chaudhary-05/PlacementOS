-- PlacementOS — per-student placement-readiness checklist.
-- Stores only the MANUAL ticks a student makes on the Placement Guide. The
-- auto-derived milestones (e.g. "Apply to 3 placements") are computed from the
-- tracker at render time and never stored here.
--
-- Run this once in the Supabase SQL editor AFTER 0004. Safe to re-run.

create table if not exists public.student_checklist (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users (id) on delete cascade,
  -- A stable READINESS_TASKS key (see lib/placement-timeline.ts).
  item_key     text not null check (char_length(item_key) <= 100),
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, item_key)
);

create index if not exists student_checklist_student_id_idx
  on public.student_checklist (student_id);

-- Keep updated_at fresh (function defined in 0001_init.sql).
drop trigger if exists student_checklist_set_updated_at on public.student_checklist;
create trigger student_checklist_set_updated_at
  before update on public.student_checklist
  for each row execute function public.set_updated_at();

-- ───────────────────────────── RLS ─────────────────────────────
-- A student may only ever see or change their own checklist rows. No other role
-- has any access.
alter table public.student_checklist enable row level security;

drop policy if exists checklist_select_own on public.student_checklist;
create policy checklist_select_own on public.student_checklist
  for select using (auth.uid() = student_id);

drop policy if exists checklist_insert_own on public.student_checklist;
create policy checklist_insert_own on public.student_checklist
  for insert with check (auth.uid() = student_id);

drop policy if exists checklist_update_own on public.student_checklist;
create policy checklist_update_own on public.student_checklist
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

drop policy if exists checklist_delete_own on public.student_checklist;
create policy checklist_delete_own on public.student_checklist
  for delete using (auth.uid() = student_id);

-- ───────────────────────── API role grants ─────────────────────────
-- (Supabase default privileges did not apply to our tables — see 0001.)
grant select, insert, update, delete on public.student_checklist to authenticated;
grant all on public.student_checklist to service_role;
