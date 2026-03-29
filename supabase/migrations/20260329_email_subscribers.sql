-- Email subscribers table for newsletter/waitlist capture (2026-03-29)
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text DEFAULT 'homepage',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

-- RLS: only service role can read
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.email_subscribers
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
