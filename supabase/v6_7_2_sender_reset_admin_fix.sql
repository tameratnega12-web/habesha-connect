-- Habesha Connect V6.7.2 sender request fields
-- Run once if sender request saving reports missing columns.
ALTER TABLE public.shipments
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS sender_phone text,
ADD COLUMN IF NOT EXISTS receiver_name text,
ADD COLUMN IF NOT EXISTS receiver_phone text,
ADD COLUMN IF NOT EXISTS package_description text;
