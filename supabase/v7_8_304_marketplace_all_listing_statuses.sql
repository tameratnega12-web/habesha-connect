-- Habesha Agenagn V7.8.304
-- Marketplace listing status constraint compatibility fix.
-- Run once in Supabase SQL Editor. Safe to run again.

begin;

alter table if exists public.marketplace_listings
  drop constraint if exists marketplace_listings_status_check;

alter table if exists public.marketplace_listings
  add constraint marketplace_listings_status_check
  check (status in (
    -- Current database/controller values
    'pending_admin',
    'admin_approved',
    'admin_declined',
    'sold_waiting_admin',
    'sold_admin_approved',
    'removed',

    -- Existing readable values kept for backward compatibility
    'Pending Admin Approval',
    'Approved',
    'Available',
    'Declined',
    'Sold Waiting Admin Verification',
    'Sold Verified',
    'Completed',
    'Closed',
    'Removed'
  ));

-- Keep the secure create function using the readable pending value already
-- used by V7.8.302/V7.8.303. The expanded constraint accepts it.
alter table if exists public.marketplace_listings
  alter column status set default 'Pending Admin Approval';

commit;
