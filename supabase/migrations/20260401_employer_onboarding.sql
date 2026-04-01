-- Track which employer onboarding emails have been sent per job
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS onboarding_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_7d_sent_at timestamptz;
