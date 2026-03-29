-- Add last_digest_sent_at column to job_alerts for weekly digest deduplication
alter table public.job_alerts 
  add column if not exists last_digest_sent_at timestamptz;

comment on column public.job_alerts.last_digest_sent_at is 
  'Timestamp of last weekly digest email sent to this subscriber. Used to prevent duplicate sends within the same week.';
