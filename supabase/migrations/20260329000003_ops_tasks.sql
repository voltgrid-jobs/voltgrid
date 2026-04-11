-- OpsGrid: ops_tasks table for mission control dashboard
-- Created: 2026-03-29

CREATE TABLE IF NOT EXISTS ops_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  project text,
  status text DEFAULT 'backlog',
  assignee text,
  priority text DEFAULT 'normal',
  briefing text,
  summary text,
  expires_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_by text DEFAULT 'felix',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ops_tasks_status_idx ON ops_tasks(status);
CREATE INDEX IF NOT EXISTS ops_tasks_assignee_idx ON ops_tasks(assignee);
CREATE INDEX IF NOT EXISTS ops_tasks_created_at_idx ON ops_tasks(created_at DESC);

-- Seed example tasks
INSERT INTO ops_tasks (title, description, project, status, assignee, priority, briefing, created_by) VALUES
(
  'Add email capture to VoltGrid homepage',
  'Add a newsletter/waitlist email capture widget to the VoltGrid Jobs homepage below the hero section. Should integrate with Resend.',
  'voltgrid',
  'tagged_for_claude',
  'claude-code',
  'high',
  E'1. Add an email input + CTA button below the hero on voltgridjobs.com\n2. On submit: POST to /api/subscribe endpoint\n3. Endpoint stores email in Supabase email_subscribers table (create if needed)\n4. Send confirmation via Resend API\n5. Style must match VoltGrid dark theme',
  'felix'
),
(
  'Fix JobHeadshot retry logic for FAL.ai failures',
  'jh-retry-failed-jobs cron is not properly retrying orders that fail with FAL.ai network errors. Need to add exponential backoff and better error classification.',
  'jobheadshot',
  'backlog',
  'claude-code',
  'urgent',
  E'Check /home/openclaw/.openclaw/workspace/projects/jobheadshot — look at the retry cron agent.\nThe issue is FAL timeout errors are being classified as permanent failures.\nAdd retry_count field to orders table, implement exponential backoff (1h, 4h, 24h).',
  'felix'
),
(
  'Weekly revenue report Telegram format',
  'The morning-digest cron sends a revenue summary but it is not well-formatted for mobile Telegram. Improve layout.',
  'ops',
  'in_progress',
  'felix',
  'normal',
  NULL,
  'filip'
),
(
  'SEO: Add schema markup to VoltGrid job listings',
  'Add JobPosting structured data (schema.org) to individual job pages on VoltGrid to improve Google Jobs indexing.',
  'voltgrid',
  'backlog',
  NULL,
  'normal',
  NULL,
  'filip'
);
