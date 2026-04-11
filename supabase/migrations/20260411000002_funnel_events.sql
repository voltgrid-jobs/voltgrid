-- funnel_events: single append-only event log for the job-seeker
-- acquisition funnel. One row per observable event. Designed to be
-- queried by date range and event type with cheap aggregates.
--
-- Event types used in application code:
--   alert_submit          — user hit submit on any /api/alerts form
--   alert_confirm         — user clicked the confirmation link
--   alert_unsubscribe     — user clicked the unsubscribe link
--   alert_delivered       — Resend webhook: email accepted by recipient MTA
--   alert_opened          — Resend webhook: recipient opened the email
--   alert_clicked         — Resend webhook: recipient clicked a link inside
--   alert_bounced         — Resend webhook: hard bounce
--   alert_complained      — Resend webhook: spam complaint
--   salary_guide_view     — client-side page view on /salary-guide
--   salary_guide_cta      — click on the "alert signup" CTA inside /salary-guide
--   serp_landing          — first page view with a search-engine referer (client helper)
--
-- No personally identifiable information beyond email is stored here.
-- The email column is nullable so anonymous events (page views, SERP
-- arrivals) can be logged before the user identifies themselves.

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type         text NOT NULL,
  email              text,
  alert_id           uuid REFERENCES public.job_alerts(id) ON DELETE SET NULL,
  source_page        text,
  referrer           text,
  resend_message_id  text,
  metadata           jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS funnel_events_event_type_idx
  ON public.funnel_events(event_type);

CREATE INDEX IF NOT EXISTS funnel_events_created_at_idx
  ON public.funnel_events(created_at DESC);

CREATE INDEX IF NOT EXISTS funnel_events_alert_id_idx
  ON public.funnel_events(alert_id)
  WHERE alert_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS funnel_events_resend_message_id_idx
  ON public.funnel_events(resend_message_id)
  WHERE resend_message_id IS NOT NULL;

-- Composite for range queries filtered by type (the most common shape)
CREATE INDEX IF NOT EXISTS funnel_events_type_created_at_idx
  ON public.funnel_events(event_type, created_at DESC);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- No public read. The service role can read/write for aggregation.
-- The anon insert policy is scoped to a narrow set of client-safe event
-- types so a malicious visitor cannot fake alert_confirm or bounce events.
DROP POLICY IF EXISTS "Anon insert client events" ON public.funnel_events;
CREATE POLICY "Anon insert client events"
  ON public.funnel_events
  FOR INSERT
  TO anon
  WITH CHECK (
    event_type IN ('salary_guide_view', 'salary_guide_cta', 'serp_landing', 'cta_impression')
  );
