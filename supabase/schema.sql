-- VoltGrid Database Schema

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS (use DO blocks since CREATE TYPE IF NOT EXISTS is not valid PG)
-- ============================================================
do $$ begin
  create type job_category as enum (
    'electrical', 'hvac', 'low_voltage', 'construction', 'project_management', 'operations', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type job_type as enum (
    'full_time', 'part_time', 'contract', 'apprenticeship'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type job_source as enum (
    'direct', 'adzuna', 'usajobs', 'greenhouse', 'lever', 'workable', 'dol_apprenticeship'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_plan as enum (
    'single_post', 'five_pack', 'pro_monthly', 'featured_addon'
  );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- EMPLOYERS
-- ============================================================
create table if not exists public.employers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  company_slug text unique not null,
  website text,
  logo_url text,
  description text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- JOBS
-- ============================================================
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.employers(id) on delete set null,
  title text not null,
  company_name text not null,
  company_logo_url text,
  category job_category not null default 'other',
  job_type job_type not null default 'full_time',
  location text not null,
  remote boolean default false,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'USD',
  description text not null,
  apply_url text,
  apply_email text,
  source job_source not null default 'direct',
  source_id text,
  is_featured boolean default false,
  is_active boolean default true,
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Trades-specific fields (added 2026-03-27)
  per_diem boolean default false,
  per_diem_rate integer,
  travel_required text check (travel_required in ('none', 'local', 'regional', 'national')),
  shift_type text check (shift_type in ('day', 'night', 'rotating', '4x10', '5x8', 'other')),
  contract_length text,
  is_union boolean default false
);

create index if not exists jobs_category_idx on public.jobs(category);
create index if not exists jobs_is_active_idx on public.jobs(is_active);
create index if not exists jobs_source_id_idx on public.jobs(source, source_id);
create index if not exists jobs_created_at_idx on public.jobs(created_at desc);

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SAVED JOBS
-- ============================================================
create table if not exists public.saved_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, job_id)
);

-- ============================================================
-- JOB ALERTS
-- ============================================================
create table if not exists public.job_alerts (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  user_id uuid references public.users(id) on delete cascade,
  keywords text,
  location text,
  category job_category,
  frequency text default 'daily' check (frequency in ('daily', 'weekly')),
  is_active boolean default true,
  last_sent_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  email text,
  created_at timestamptz default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.employers(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  plan payment_plan not null,
  amount_cents integer not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending', 'complete', 'failed', 'refunded')),
  credits_added integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EMPLOYER CREDITS
-- ============================================================
create table if not exists public.employer_credits (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.employers(id) on delete cascade unique,
  post_credits integer default 0,
  is_pro boolean default false,
  pro_renews_at timestamptz,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.employers enable row level security;
alter table public.jobs enable row level security;
alter table public.users enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_alerts enable row level security;
alter table public.applications enable row level security;
alter table public.payments enable row level security;
alter table public.employer_credits enable row level security;

-- Drop existing policies to avoid conflicts on re-run
do $$ declare
  r record;
begin
  for r in (select policyname, tablename from pg_policies where schemaname = 'public') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public read active jobs
create policy "Public read active jobs" on public.jobs
  for select using (is_active = true);

-- Public read employers
create policy "Public read employers" on public.employers
  for select using (true);

-- Users manage own profile
create policy "Users manage own profile" on public.users
  for all using (auth.uid() = id);

-- Users manage own saved jobs
create policy "Users manage own saved jobs" on public.saved_jobs
  for all using (auth.uid() = user_id);

-- Users manage own alerts
create policy "Users manage own alerts" on public.job_alerts
  for all using (auth.uid() = user_id);

-- Employers manage own profile
create policy "Employers manage own profile" on public.employers
  for all using (auth.uid() = user_id);

-- Employers manage own jobs
create policy "Employers manage own jobs" on public.jobs
  for all using (
    employer_id in (select id from public.employers where user_id = auth.uid())
  );

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists employers_updated_at on public.employers;
create trigger employers_updated_at before update on public.employers
  for each row execute function public.handle_updated_at();

drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.handle_updated_at();

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();
