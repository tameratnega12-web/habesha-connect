-- Habesha Agenagn V7.8.226 Taxi/Limo ride status constraint match
-- Run once in Supabase SQL Editor after V7.8.225.
-- Safe to run more than once.

begin;

-- Normalize known legacy values before installing the current status constraint.
update public.taxi_ride_requests
set status = case lower(trim(coalesce(status,'')))
  when '' then 'Pending Admin Approval'
  when 'pending' then 'Pending Admin Approval'
  when 'pending_admin' then 'Pending Admin Approval'
  when 'pending admin' then 'Pending Admin Approval'
  when 'pending_admin_approval' then 'Pending Admin Approval'
  when 'approved' then 'Approved - Waiting Driver'
  when 'waiting_driver' then 'Approved - Waiting Driver'
  when 'driver_accepted' then 'Driver Accepted - Waiting Admin Approval'
  when 'driver_approved' then 'Driver Approved - Contact Shared'
  when 'arrived' then 'Driver Arrived'
  when 'in_progress' then 'In Progress'
  when 'completed' then 'Completed - Waiting Admin Verification'
  when 'verified' then 'Completed - Admin Verified'
  when 'payment_received' then 'Payment Received / History'
  when 'cancelled' then 'Cancelled by Rider'
  when 'canceled' then 'Cancelled by Rider'
  when 'declined' then 'Declined by Admin'
  else status
end;

alter table public.taxi_ride_requests
  alter column status set default 'Pending Admin Approval';

alter table public.taxi_ride_requests
  drop constraint if exists taxi_ride_requests_status_check;

alter table public.taxi_ride_requests
  add constraint taxi_ride_requests_status_check
  check (status in (
    'Pending Admin Approval',
    'Approved - Waiting Driver',
    'Declined by Admin',
    'Driver Accepted - Waiting Admin Approval',
    'Driver Approved - Contact Shared',
    'Driver Arrived',
    'In Progress',
    'Completed - Waiting Admin Verification',
    'Completed - Admin Verified',
    'Payment Received / History',
    'Cancelled by Rider'
  ));

commit;
