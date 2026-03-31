-- companies: canonical company table for programmatic SEO pages and employer directory
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  logo_url text,
  website text,
  created_at timestamptz default now()
);

create unique index if not exists companies_name_idx on companies(name);
create unique index if not exists companies_slug_idx on companies(slug);

-- Add company_id FK to jobs table (nullable — not all jobs will resolve to a canonical company)
alter table jobs add column if not exists company_id uuid references companies(id);

-- Backfill: create company entries from existing distinct job company_name strings.
-- On slug or name conflict the row is skipped (acceptable — FK is nullable).
insert into companies (name, slug)
select
  company_name as name,
  regexp_replace(lower(trim(company_name)), '[^a-z0-9]+', '-', 'g') as slug
from (
  select distinct company_name from jobs where company_name is not null and trim(company_name) != ''
) sub
on conflict do nothing;

-- Backfill company_id on existing jobs
update jobs j
set company_id = c.id
from companies c
where j.company_name = c.name
  and j.company_id is null;
