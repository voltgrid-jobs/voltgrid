-- Double opt-in + token-based management for job_alerts
-- Adds confirmation flow (Mode A: click-to-confirm link in email)
-- and token-based unsubscribe / preference center for unauthenticated
-- subscribers.
--
-- Backfill policy: every existing row is treated as already confirmed,
-- so current subscribers keep receiving alerts without interruption.
-- Only NEW signups after this migration require confirmation.

ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS confirmation_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

-- Unique index so /alerts/confirm?t=... and /alerts/manage?t=... can look
-- up a single row fast without exposing the numeric primary key in links.
CREATE UNIQUE INDEX IF NOT EXISTS job_alerts_confirmation_token_idx
  ON public.job_alerts(confirmation_token);

-- Backfill existing rows so they stay active. Only rows created before
-- this migration get an automatic confirmed_at — anything added after
-- must go through the confirmation flow.
UPDATE public.job_alerts
  SET confirmed_at = created_at
  WHERE confirmed_at IS NULL;

-- Ensure every existing row has a token for unsubscribe links.
UPDATE public.job_alerts
  SET confirmation_token = gen_random_uuid()
  WHERE confirmation_token IS NULL;
