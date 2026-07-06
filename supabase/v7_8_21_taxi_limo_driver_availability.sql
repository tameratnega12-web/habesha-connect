-- Habesha Connect V7.8.21 Taxi/Limo Driver Availability Update
-- Run only if you already use Supabase tables for Taxi/Limo.
-- This keeps old columns but adds the new driver-first availability fields.

alter table if exists taxi_driver_applications
  add column if not exists experience text,
  add column if not exists availability text,
  add column if not exists service_area text,
  add column if not exists driver_notes text;

-- Existing vehicle/insurance columns are NOT deleted so old data and old code will not break.
-- The new app code no longer asks Taxi/Limo drivers for vehicle or insurance information.
-- Taxi/Limo owners provide vehicles and request/assign approved drivers through admin approval.

create index if not exists taxi_driver_applications_availability_idx
on taxi_driver_applications(availability);

create index if not exists taxi_driver_applications_service_area_idx
on taxi_driver_applications(service_area);
