-- Migration: trades-specific listing fields + union signatory
-- Date: 2026-03-27
-- Apply via Supabase SQL Editor or supabase db push

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS per_diem boolean DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS per_diem_rate integer;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS travel_required text CHECK (travel_required IN ('none', 'local', 'regional', 'national'));
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS shift_type text CHECK (shift_type IN ('day', 'night', 'rotating', '4x10', '5x8', 'other'));
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contract_length text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_union boolean DEFAULT false;
