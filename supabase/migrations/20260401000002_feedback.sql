CREATE TABLE IF NOT EXISTS public.feedback (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type  text CHECK (user_type IN ('job_seeker', 'employer')),
  rating     smallint CHECK (rating BETWEEN 1 AND 5),
  message    text,
  page_url   text,
  created_at timestamptz NOT NULL DEFAULT now()
);
