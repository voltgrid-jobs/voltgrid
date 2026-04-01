ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS source_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL;
