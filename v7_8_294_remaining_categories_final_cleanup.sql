-- Habesha Agenagn V7.8.294
-- Final cleanup for Taxi/Limo, Marketplace, Home Services, Business Jobs and Events.
-- Shipping, Rentals and Trucking are intentionally untouched.
-- Safe to run more than once.

begin;

-- Allow a ride participant to remove a ride after the final payment confirmation.
alter table if exists public.taxi_ride_requests enable row level security;
drop policy if exists "v78294 taxi ride participant final delete" on public.taxi_ride_requests;
create policy "v78294 taxi ride participant final delete"
on public.taxi_ride_requests for delete
to authenticated
using (
  lower(coalesce(rider_email,''))=lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(driver_email,''))=lower(coalesce(auth.jwt()->>'email',''))
);

-- One-time removal of completed/declined transaction rows left by older versions.
delete from public.taxi_ride_requests
where lower(coalesce(status,'')) in (
  'payment received / history','payment received','closed','cancelled','declined','completed'
);

delete from public.taxi_limo_driver_assignments
where lower(coalesce(status,'')) in (
  'ended','employment ended','driver declined','admin declined','closed','cancelled'
);

delete from public.marketplace_purchase_requests
where lower(coalesce(status,'')) in (
  'completed','cancelled','admin declined','seller declined','connection declined','closed'
);

delete from public.marketplace_listings
where lower(coalesce(status,'')) in (
  'sold','sold verified','completed','closed','cancelled'
);

delete from public.home_service_requests
where lower(coalesce(status,'')) in ('completed','closed','cancelled','declined');

delete from public.home_service_customer_jobs
where lower(coalesce(status,'')) in ('completed','closed','cancelled','declined');

delete from public.hc_job_applications
where lower(coalesce(status,'')) in ('applicant agreed','closed','completed','cancelled','declined');

-- Declined/cancelled event submissions are not public events and should not remain active.
delete from public.community_events
where lower(coalesce(status,'')) in ('declined','cancelled','closed');

commit;
