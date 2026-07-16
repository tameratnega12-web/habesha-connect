-- Habesha Agenagn V7.8.323
-- Match approved Taxi/Limo drivers to customer rides by Supabase Auth UUID.
-- Run once in Supabase SQL Editor. Safe to run more than once.

begin;

alter table public.taxi_ride_requests
  add column if not exists rider_id uuid;

alter table public.taxi_ride_requests
  add column if not exists driver_id uuid;

create index if not exists taxi_ride_requests_driver_id_idx
  on public.taxi_ride_requests(driver_id);

create index if not exists taxi_driver_applications_user_id_idx
  on public.taxi_driver_applications(user_id);

-- Backfill old driver applications from the matching Supabase Auth email.
update public.taxi_driver_applications a
set user_id = u.id,
    updated_at = now()
from auth.users u
where a.user_id is null
  and lower(trim(a.email)) = lower(trim(u.email));

-- Keep one driver application per Supabase account when user_id is present.
create unique index if not exists taxi_driver_applications_user_id_unique_idx
  on public.taxi_driver_applications(user_id)
  where user_id is not null;

create or replace function public.accept_taxi_ride_v78323(p_ride_id uuid)
returns public.taxi_ride_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_driver public.taxi_driver_applications;
  v_row public.taxi_ride_requests;
begin
  if v_uid is null then
    raise exception 'DRIVER_NOT_APPROVED';
  end if;

  select * into v_driver
  from public.taxi_driver_applications
  where user_id = v_uid
    and lower(trim(status)) = 'approved'
  order by updated_at desc nulls last, created_at desc
  limit 1;

  -- Repair an older application that was created before user_id was stored.
  if v_driver.id is null and v_email <> '' then
    update public.taxi_driver_applications
       set user_id = v_uid,
           updated_at = now()
     where id = (
       select id
       from public.taxi_driver_applications
       where user_id is null
         and lower(trim(email)) = v_email
         and lower(trim(status)) = 'approved'
       order by updated_at desc nulls last, created_at desc
       limit 1
     )
    returning * into v_driver;
  end if;

  if v_driver.id is null then
    raise exception 'DRIVER_NOT_APPROVED';
  end if;

  update public.taxi_ride_requests
     set driver_id = v_uid,
         driver_name = coalesce(v_driver.full_name, ''),
         driver_email = lower(trim(coalesce(v_driver.email, v_email))),
         driver_phone = coalesce(v_driver.phone, ''),
         status = 'Driver Accepted - Waiting Customer Agreement',
         details = coalesce(details, '{}'::jsonb) || jsonb_build_object(
           'driverId', v_uid,
           'driverName', coalesce(v_driver.full_name, ''),
           'driverEmail', lower(trim(coalesce(v_driver.email, v_email))),
           'driverPhone', coalesce(v_driver.phone, ''),
           'providerType', 'Taxi/Limo Driver',
           'providerArea', coalesce(v_driver.service_area, ''),
           'customerAgreed', false,
           'customerAgreedAt', '',
           'acceptedAt', now()
         ),
         updated_at = now()
   where id = p_ride_id
     and status = 'Approved - Waiting Driver'
     and driver_id is null
     and coalesce(trim(driver_email), '') = ''
  returning * into v_row;

  if v_row.id is null then
    raise exception 'RIDE_NOT_AVAILABLE';
  end if;

  return v_row;
end;
$$;

revoke all on function public.accept_taxi_ride_v78323(uuid) from public;
grant execute on function public.accept_taxi_ride_v78323(uuid) to authenticated;

commit;
