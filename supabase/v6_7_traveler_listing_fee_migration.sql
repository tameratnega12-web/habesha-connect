-- Habesha Connect V6.7 traveler listing fee and refund migration
-- Run once in Supabase SQL Editor after uploading V6.7.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS listing_fee_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_fee_amount numeric DEFAULT 10,
  ADD COLUMN IF NOT EXISTS listing_fee_refunded boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_fee_paid_at timestamptz;

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS traveler_listing_fee_refund numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traveler_payout_amount numeric DEFAULT 0;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS traveler_trip_listing_fee numeric DEFAULT 10;
