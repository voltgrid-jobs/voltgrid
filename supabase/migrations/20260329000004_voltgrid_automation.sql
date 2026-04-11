-- VoltGrid automation support columns (2026-03-29)
-- Expiry reminder flag
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS expiry_reminder_sent boolean DEFAULT false;

-- Featured flag (used by Pro plan auto-feature)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Employer email stored on job row for direct email access without auth join
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_email text;
