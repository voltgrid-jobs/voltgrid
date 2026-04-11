-- locations: canonical location table for programmatic SEO pages
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  display_name text not null,
  region text,
  country text default 'US',
  created_at timestamptz default now()
);

create unique index if not exists locations_name_idx on locations(name);
create unique index if not exists locations_slug_idx on locations(slug);

-- Add location_id FK to jobs table (nullable — not all jobs will have a canonical location)
alter table jobs add column if not exists location_id uuid references locations(id);

-- Backfill: create location entries from existing distinct job location strings.
-- Slug is derived inline; on slug conflict the row is skipped (acceptable — FK is nullable).
insert into locations (name, slug, display_name)
select
  location as name,
  regexp_replace(lower(trim(location)), '[^a-z0-9]+', '-', 'g') as slug,
  location as display_name
from (
  select distinct location from jobs where location is not null and trim(location) != ''
) sub
on conflict do nothing;

-- Backfill location_id on existing jobs
update jobs j
set location_id = l.id
from locations l
where j.location = l.name
  and j.location_id is null;
