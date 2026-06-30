-- Habesha Connect V6.6 Traveler payout tracking
-- Run once in Supabase SQL Editor.
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS traveler_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS traveler_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS traveler_payout_method text,
  ADD COLUMN IF NOT EXISTS traveler_payout_note text;
