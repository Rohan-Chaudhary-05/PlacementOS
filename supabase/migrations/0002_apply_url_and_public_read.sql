-- PlacementOS — adds the company-provided application link and a privacy-preserving
-- public read path so ACCEPTED opportunities can be surfaced on the public
-- /opportunities tab (each with a detail page + "Apply" button).
--
-- Run this once in the Supabase SQL editor AFTER 0001_init.sql.
-- Safe to re-run: guarded with IF NOT EXISTS / CREATE OR REPLACE.

-- ───────────────────────── New columns ─────────────────────────
-- apply_url      : where students click "Apply" (the link the company provides).
-- company_website: optional company link shown on the opportunity detail page.
-- Both are nullable at the DB level (existing rows predate them); apply_url is
-- required by the app's validation for new submissions.
alter table public.opportunities add column if not exists apply_url      text;
alter table public.opportunities add column if not exists company_website text;

-- ───────────────────── Public read functions ─────────────────────
-- SECURITY DEFINER so anonymous visitors can read ACCEPTED listings WITHOUT a
-- table-level SELECT grant (which would also expose company_email / internal
-- review fields). These functions return only the safe, public columns and only
-- for rows a reviewer has accepted — never UNDER_REVIEW or DENIED. Same pattern
-- as waitlist_count(): the definer owns the table, so RLS is bypassed safely
-- because the function body itself is the access-control boundary.

-- All accepted opportunities, newest first.
create or replace function public.public_opportunities()
returns table (
  id              uuid,
  company_name    text,
  company_website text,
  role            text,
  description     text,
  location        text,
  work_mode       text,
  salary_min      integer,
  salary_max      integer,
  currency        text,
  sector          text,
  duration        text,
  deadline        text,
  company_values  text,
  requirements    text,
  apply_url       text,
  created_at      timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id, o.company_name, o.company_website, o.role, o.description, o.location,
    o.work_mode, o.salary_min, o.salary_max, o.currency, o.sector, o.duration,
    o.deadline, o.company_values, o.requirements, o.apply_url, o.created_at
  from public.opportunities o
  where o.status = 'ACCEPTED'
  order by o.created_at desc;
$$;

-- A single accepted opportunity by id (for the detail page). Returns no row if
-- the id is unknown or the opportunity is not ACCEPTED.
create or replace function public.public_opportunity(p_id uuid)
returns table (
  id              uuid,
  company_name    text,
  company_website text,
  role            text,
  description     text,
  location        text,
  work_mode       text,
  salary_min      integer,
  salary_max      integer,
  currency        text,
  sector          text,
  duration        text,
  deadline        text,
  company_values  text,
  requirements    text,
  apply_url       text,
  created_at      timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id, o.company_name, o.company_website, o.role, o.description, o.location,
    o.work_mode, o.salary_min, o.salary_max, o.currency, o.sector, o.duration,
    o.deadline, o.company_values, o.requirements, o.apply_url, o.created_at
  from public.opportunities o
  where o.id = p_id and o.status = 'ACCEPTED';
$$;

grant execute on function public.public_opportunities()        to anon, authenticated;
grant execute on function public.public_opportunity(uuid)      to anon, authenticated;
