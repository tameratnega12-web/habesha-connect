-- Habesha Connect V7.8.91 Taxi/Limo Ride Requests
-- Run this in Supabase SQL Editor one time before testing customer ride requests.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.taxi_ride_requests (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  rider_name text,
  rider_email text,
  rider_phone text,
  pickup text,
  destination text,
  ride_date date,
  ride_time text,
  passengers text,
  notes text,
  status text default 'Pending Admin Approval',
  driver_name text,
  driver_email text,
  driver_phone text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.taxi_ride_requests add column if not exists local_ref text;
alter table public.taxi_ride_requests add column if not exists rider_name text;
alter table public.taxi_ride_requests add column if not exists rider_email text;
alter table public.taxi_ride_requests add column if not exists rider_phone text;
alter table public.taxi_ride_requests add column if not exists pickup text;
alter table public.taxi_ride_requests add column if not exists destination text;
alter table public.taxi_ride_requests add column if not exists ride_date date;
alter table public.taxi_ride_requests add column if not exists ride_time text;
alter table public.taxi_ride_requests add column if not exists passengers text;
alter table public.taxi_ride_requests add column if not exists notes text;
alter table public.taxi_ride_requests add column if not exists status text default 'Pending Admin Approval';
alter table public.taxi_ride_requests add column if not exists driver_name text;
alter table public.taxi_ride_requests add column if not exists driver_email text;
alter table public.taxi_ride_requests add column if not exists driver_phone text;
alter table public.taxi_ride_requests add column if not exists details jsonb default '{}'::jsonb;
alter table public.taxi_ride_requests add column if not exists created_at timestamptz default now();
alter table public.taxi_ride_requests add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'taxi_ride_requests_local_ref_key'
  ) then
    alter table public.taxi_ride_requests add constraint taxi_ride_requests_local_ref_key unique (local_ref);
  end if;
end $$;

create index if not exists taxi_ride_requests_status_idx on public.taxi_ride_requests(status);
create index if not exists taxi_ride_requests_rider_email_idx on public.taxi_ride_requests(lower(rider_email));
create index if not exists taxi_ride_requests_driver_email_idx on public.taxi_ride_requests(lower(driver_email));
create index if not exists taxi_ride_requests_ride_date_idx on public.taxi_ride_requests(ride_date);

alter table public.taxi_ride_requests enable row level security;

drop policy if exists "taxi_ride_requests_select_all" on public.taxi_ride_requests;
drop policy if exists "taxi_ride_requests_insert_auth" on public.taxi_ride_requests;
drop policy if exists "taxi_ride_requests_update_auth" on public.taxi_ride_requests;
drop policy if exists "taxi_ride_requests_delete_auth" on public.taxi_ride_requests;

create policy "taxi_ride_requests_select_all"
on public.taxi_ride_requests for select
using (true);

create policy "taxi_ride_requests_insert_auth"
on public.taxi_ride_requests for insert
to authenticated
with check (true);

create policy "taxi_ride_requests_update_auth"
on public.taxi_ride_requests for update
to authenticated
using (true)
with check (true);

create policy "taxi_ride_requests_delete_auth"
on public.taxi_ride_requests for delete
to authenticated
using (true);
