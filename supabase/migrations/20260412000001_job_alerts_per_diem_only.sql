ALTER TABLE public.job_alerts ADD COLUMN IF NOT EXISTS per_diem_only boolean DEFAULT false;
