-- Habesha Agenagn V7.8.317 Taxi/Limo customer-to-driver flow alignment
-- REQUIRED: Run once in Supabase SQL Editor before testing V7.8.317.
-- Safe to run more than once.

begin;

-- Allow the two exact customer/driver workflow states.
alter table public.taxi_ride_requests
  drop constraint if exists taxi_ride_requests_status_check;

alter table public.taxi_ride_requests
  add constraint taxi_ride_requests_status_check
  check (status in (
    'Pending Admin Approval',
    'Approved - Waiting Driver',
    'Declined by Admin',
    'Driver Accepted - Waiting Customer Agreement',
    'Customer Agreed - Contact Shared',
    'Driver Arrived',
    'In Progress',
    'Completed - Waiting Admin Verification',
    'Completed - Admin Verified',
    'Payment Received / History',
    'Cancelled by Rider'
  ));

-- Atomically claim one approved ride for one driver. Only the first driver succeeds.
create or replace function public.accept_taxi_ride_v78317(
  p_ride_id uuid,
  p_driver_name text,
  p_driver_email text,
  p_driver_phone text,
  p_provider_type text,
  p_provider_area text
)
returns public.taxi_ride_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.taxi_ride_requests;
begin
  update public.taxi_ride_requests
     set driver_name = coalesce(p_driver_name, ''),
         driver_email = lower(trim(coalesce(p_driver_email, ''))),
         driver_phone = coalesce(p_driver_phone, ''),
         status = 'Driver Accepted - Waiting Customer Agreement',
         details = coalesce(details, '{}'::jsonb) || jsonb_build_object(
           'driverName', coalesce(p_driver_name, ''),
           'driverEmail', lower(trim(coalesce(p_driver_email, ''))),
           'driverPhone', coalesce(p_driver_phone, ''),
           'providerType', coalesce(p_provider_type, 'Taxi/Limo Driver'),
           'providerArea', coalesce(p_provider_area, ''),
           'providerCompany', '',
           'customerAgreed', false,
           'customerAgreedAt', '',
           'acceptedAt', now()
         ),
         updated_at = now()
   where id = p_ride_id
     and status = 'Approved - Waiting Driver'
     and coalesce(trim(driver_email), '') = ''
  returning * into v_row;

  if v_row.id is null then
    raise exception 'RIDE_NOT_AVAILABLE';
  end if;

  return v_row;
end;
$$;

revoke all on function public.accept_taxi_ride_v78317(uuid,text,text,text,text,text) from public;
grant execute on function public.accept_taxi_ride_v78317(uuid,text,text,text,text,text) to authenticated;

commit;
