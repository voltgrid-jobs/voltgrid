-- Add unique constraints to prevent duplicate signups
-- email_subscribers: one row per email
-- job_alerts: one row per email+category combination

-- email_subscribers unique constraint (may already exist from schema — use IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_subscribers_email_key'
      AND conrelid = 'public.email_subscribers'::regclass
  ) THEN
    ALTER TABLE public.email_subscribers ADD CONSTRAINT email_subscribers_email_key UNIQUE (email);
  END IF;
END $$;

-- job_alerts unique constraint: one alert per email+category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_alerts_email_category_key'
      AND conrelid = 'public.job_alerts'::regclass
  ) THEN
    ALTER TABLE public.job_alerts ADD CONSTRAINT job_alerts_email_category_key UNIQUE (email, category);
  END IF;
END $$;
