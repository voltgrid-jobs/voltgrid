-- Add salary_period to jobs table
-- Values: 'year' | 'hour' | 'day' | 'week' | 'month'
-- Existing rows default to 'year' (most common for salaried roles)
alter table public.jobs
  add column if not exists salary_period text default 'year';
