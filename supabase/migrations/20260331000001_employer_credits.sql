-- employer_credits: unified table for free (admin-granted) and paid (Stripe) credits
-- Email-indexed for admin grant lookups, employer_id-indexed for Stripe webhook lookups
create table if not exists employer_credits (
  id uuid primary key default gen_random_uuid(),

  -- Email-based access (admin grants / cold outreach)
  employer_email text,
  credits_remaining integer not null default 0,
  credits_total_granted integer not null default 0,
  granted_by text,
  reason text,

  -- Employer-id-based access (Stripe paid plans: 5-pack, pro_monthly)
  employer_id uuid references employers(id),
  post_credits integer not null default 0,
  is_pro boolean not null default false,
  pro_renews_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Unique partial indexes so both lookup patterns can coexist in one table
create unique index if not exists employer_credits_email_idx
  on employer_credits(employer_email) where employer_email is not null;

create unique index if not exists employer_credits_employer_id_idx
  on employer_credits(employer_id) where employer_id is not null;

-- credit_events: immutable audit trail for every grant and use
create table if not exists credit_events (
  id uuid primary key default gen_random_uuid(),
  employer_email text not null,
  event_type text not null check (event_type in ('granted', 'used')),
  credits_delta integer not null,
  reason text,
  granted_by text,
  job_id uuid references jobs(id),
  created_at timestamptz default now()
);
