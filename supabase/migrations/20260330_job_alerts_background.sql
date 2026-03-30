-- Add background qualifier column to job_alerts (2026-03-30)
ALTER TABLE public.job_alerts ADD COLUMN IF NOT EXISTS background text;
