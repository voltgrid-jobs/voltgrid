-- Add explicit trade_pref and location_pref columns to job_alerts so
-- the "all trades" and "all locations" selections are stored as first-
-- class values, not as NULL / empty-string proxies.
--
-- The legacy category (enum) and location (text) columns stay in place
-- for the existing cron jobs that read from them. The /api/alerts route
-- dual-writes both columns so new signups populate both.
--
-- Semantics:
--   trade_pref    = 'electrical' | 'hvac' | 'low_voltage' | 'all'
--   location_pref = free text city/state OR the literal 'all'
--
-- A subscriber with trade_pref='all' and location_pref='all' is a
-- legitimate preference — typically a traveling worker who wants
-- every new listing. They are NOT an empty/fallback state.

ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS trade_pref text,
  ADD COLUMN IF NOT EXISTS location_pref text;

COMMENT ON COLUMN public.job_alerts.trade_pref IS
  'Explicit user preference: electrical | hvac | low_voltage | all. "all" is a valid selection, not a fallback.';

COMMENT ON COLUMN public.job_alerts.location_pref IS
  'Explicit user preference: free text city/state OR the literal "all". "all" is a valid selection, not a fallback.';

-- Backfill legacy rows so /alerts/manage and future cron filters can
-- rely on these columns. Category enum values map 1:1 to trade_pref.
UPDATE public.job_alerts
  SET trade_pref = COALESCE(category::text, 'all')
  WHERE trade_pref IS NULL;

UPDATE public.job_alerts
  SET location_pref = CASE
    WHEN location IS NULL OR btrim(location) = '' THEN 'all'
    ELSE location
  END
  WHERE location_pref IS NULL;

-- Lightweight index to support future per-trade digest queries.
CREATE INDEX IF NOT EXISTS job_alerts_trade_pref_idx
  ON public.job_alerts(trade_pref)
  WHERE trade_pref IS NOT NULL;
