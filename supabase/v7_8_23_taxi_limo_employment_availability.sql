-- V7.8.23 Taxi/Limo Employment Availability Update
-- Run this in Supabase SQL Editor only if these columns do not already exist.

alter table if exists taxi_driver_applications
  add column if not exists owner_email text,
  add column if not exists assigned_vehicle_id text,
  add column if not exists assigned_vehicle text,
  add column if not exists availability_status text default 'Available';

alter table if exists taxi_limo_driver_assignments
  add column if not exists hired_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists ended_by text;

create index if not exists taxi_driver_applications_owner_email_idx
  on taxi_driver_applications(owner_email);

create index if not exists taxi_driver_applications_availability_status_idx
  on taxi_driver_applications(availability_status);
