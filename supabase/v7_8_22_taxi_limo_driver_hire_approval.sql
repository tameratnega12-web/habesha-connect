-- Habesha Connect V7.8.22 Taxi/Limo Owner-Driver Hire Approval
-- Driver application -> Admin approval -> Owner requests driver -> Driver accepts/declines -> Admin approves connection.
-- Run this in Supabase SQL Editor only if you use Supabase tables for Taxi/Limo.

-- Add driver acceptance tracking fields to owner/driver assignment table.
alter table if exists taxi_limo_driver_assignments
  add column if not exists driver_response text,
  add column if not exists driver_responded_at timestamptz,
  add column if not exists driver_note text;

-- Update status constraint so the hire request can wait for the driver before admin approval.
alter table if exists taxi_limo_driver_assignments
  drop constraint if exists taxi_limo_driver_assignments_status_check;

alter table if exists taxi_limo_driver_assignments
  add constraint taxi_limo_driver_assignments_status_check
  check (status in (
    'pending_driver_acceptance',
    'waiting_driver_acceptance',
    'driver_accepted_pending_admin',
    'pending_admin',
    'approved',
    'driver_declined',
    'declined',
    'ended'
  ));

-- Optional indexes for owner and driver dashboards.
create index if not exists taxi_limo_assign_driver_status_idx
on taxi_limo_driver_assignments(driver_email, status);

create index if not exists taxi_limo_assign_owner_status_idx
on taxi_limo_driver_assignments(owner_email, status);

-- Note for this app version:
-- The frontend stores statuses as readable labels:
--   Waiting Driver Acceptance
--   Pending Admin Approval
--   Driver Declined
--   Approved
-- If your Supabase integration stores lowercase statuses instead, map them as:
--   Waiting Driver Acceptance -> waiting_driver_acceptance
--   Pending Admin Approval -> pending_admin
--   Driver Declined -> driver_declined
--   Approved -> approved
