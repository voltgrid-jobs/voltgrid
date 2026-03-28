-- Apply click tracking
create table if not exists public.apply_clicks (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs(id) on delete cascade,
  source       text not null default 'unknown', -- 'top_button' | 'bottom_button'
  clicked_at   timestamptz not null default now()
);

-- Index for fast aggregation per job
create index if not exists apply_clicks_job_id_idx on public.apply_clicks(job_id);
-- Index for time-series queries
create index if not exists apply_clicks_clicked_at_idx on public.apply_clicks(clicked_at);

-- Public insert allowed (anon users can click Apply); no read access for anon
alter table public.apply_clicks enable row level security;

create policy "Anyone can insert apply clicks"
  on public.apply_clicks for insert
  with check (true);

-- Only authenticated service role can read (used by admin page via admin client)
create policy "Service role can read apply clicks"
  on public.apply_clicks for select
  using (auth.role() = 'service_role');
