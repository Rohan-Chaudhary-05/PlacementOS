-- PlacementOS schema, RLS policies, and auth triggers.
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: guarded with IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS.

-- ───────────────────────────── Tables ─────────────────────────────

-- One profile row per auth user. `role` is the authorization source of truth.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'student' check (role in ('student', 'company', 'staff')),
  company_name text,
  created_at   timestamptz not null default now()
);

-- Opportunities posted by companies, reviewed by staff.
create table if not exists public.opportunities (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references auth.users (id) on delete cascade,
  company_name   text not null,
  company_email  text not null,
  role           text not null,
  description    text not null,
  location       text not null,
  work_mode      text not null check (work_mode in ('REMOTE', 'HYBRID', 'OFFICE')),
  salary_min     integer not null,
  salary_max     integer not null,
  currency       text not null default 'GBP',
  sector         text not null,
  duration       text not null,
  deadline       text,
  company_values text,
  requirements   text,
  status         text not null default 'UNDER_REVIEW' check (status in ('UNDER_REVIEW', 'ACCEPTED', 'DENIED')),
  review_note    text,
  reviewed_by    uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint opportunities_salary_valid
    check (salary_min > 0 and salary_max >= salary_min and salary_max <= 100000000)
);

create index if not exists opportunities_company_id_idx on public.opportunities (company_id);
create index if not exists opportunities_status_idx on public.opportunities (status);

-- Student waitlist (double opt-in). Written only via the server (service role).
create table if not exists public.waitlist_signups (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  email      text not null unique,
  confirmed  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ──────────────────────── Helper functions ────────────────────────

-- SECURITY DEFINER so RLS policies can call it without recursing into profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'staff'
  );
$$;

-- Public confirmed-waitlist count for the homepage. SECURITY DEFINER returns only
-- the aggregate (never any row), so it is safe to expose to anonymous visitors.
create or replace function public.waitlist_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.waitlist_signups where confirmed = true;
$$;

grant execute on function public.waitlist_count() to anon, authenticated;

-- Keep opportunities.updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ──────────────────── Auth triggers (on auth.users) ────────────────────

-- Reject company sign-ups that use a personal / free email provider.
-- DB-level enforcement so it cannot be bypassed by calling the public auth API directly.
create or replace function public.enforce_company_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role   text := new.raw_user_meta_data ->> 'role';
  email_domain text := lower(split_part(coalesce(new.email, ''), '@', 2));
  -- Keep this list in sync with FREE_EMAIL_PROVIDERS in lib/constants.ts.
  free_domains text[] := array[
    'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de','yahoo.ca','yahoo.in','ymail.com','rocketmail.com',
    'hotmail.com','hotmail.co.uk','hotmail.fr','outlook.com','outlook.fr','live.com','live.co.uk','msn.com',
    'icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com','pm.me','tutanota.com','tuta.io',
    'gmx.com','gmx.co.uk','gmx.de','mail.com','mail.ru','yandex.com','yandex.ru','zoho.com','fastmail.com','hey.com',
    'qq.com','163.com','126.com','web.de','naver.com','rediffmail.com','hushmail.com'
  ];
begin
  -- Match the exact domain or any subdomain of a free provider (mail.gmail.com).
  if meta_role = 'company'
     and exists (
       select 1 from unnest(free_domains) d
       where email_domain = d or email_domain like '%.' || d
     ) then
    raise exception 'Company registration requires a company email address, not a personal one.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists before_auth_user_company_email on auth.users;
create trigger before_auth_user_company_email
  before insert on auth.users
  for each row execute function public.enforce_company_email();

-- Create the profile row when an auth user is created.
-- The client-supplied role is sanitized: only 'company' or 'student' are honoured here.
-- 'staff' can NEVER be granted via sign-up — it is set only by the seed script (service role).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  safe_role      text := case when requested_role in ('company', 'student') then requested_role else 'student' end;
begin
  insert into public.profiles (id, role, company_name)
  values (new.id, safe_role, new.raw_user_meta_data ->> 'company_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────── RLS ─────────────────────────────

alter table public.profiles        enable row level security;
alter table public.opportunities   enable row level security;
alter table public.waitlist_signups enable row level security;

-- profiles: a user can read their own row; staff can read all. No client writes
-- (role is set by triggers / seed only), which prevents privilege escalation.
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles
  for select using (auth.uid() = id or public.is_staff());

-- opportunities: a company sees/creates only its own; staff see all and update status.
drop policy if exists opportunities_select_own_or_staff on public.opportunities;
create policy opportunities_select_own_or_staff on public.opportunities
  for select using (auth.uid() = company_id or public.is_staff());

drop policy if exists opportunities_insert_own_company on public.opportunities;
create policy opportunities_insert_own_company on public.opportunities
  for insert with check (
    auth.uid() = company_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'company')
  );

drop policy if exists opportunities_update_staff on public.opportunities;
create policy opportunities_update_staff on public.opportunities
  for update using (public.is_staff()) with check (public.is_staff());

-- waitlist_signups: only staff can read; all writes go through the service role
-- (which bypasses RLS), so no insert/update policy is exposed to clients.
drop policy if exists waitlist_select_staff on public.waitlist_signups;
create policy waitlist_select_staff on public.waitlist_signups
  for select using (public.is_staff());

-- ───────────────────────── API role grants ─────────────────────────
-- The API roles reach tables through these grants; RLS (above) still governs
-- which rows each role may access. Without these, Supabase returns
-- "permission denied" if the project's default privileges weren't applied.
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant select, insert, update on public.opportunities to authenticated;
grant select on public.waitlist_signups to authenticated;

-- service_role bypasses RLS for privileged writes (seed, waitlist, callback).
grant all on public.profiles to service_role;
grant all on public.opportunities to service_role;
grant all on public.waitlist_signups to service_role;
