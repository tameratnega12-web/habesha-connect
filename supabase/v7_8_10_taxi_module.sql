-- V7.8.10 Taxi Module tables (optional Supabase persistence for next backend sync step)
create table if not exists public.taxi_driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  phone text,
  vehicle text,
  license text,
  insurance text,
  area text,
  status text default 'Pending Admin Approval',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.taxi_ride_requests (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references auth.users(id) on delete set null,
  rider_name text,
  rider_email text,
  rider_phone text,
  pickup text not null,
  destination text not null,
  pickup_time text,
  passengers integer default 1,
  note text,
  driver_id uuid references auth.users(id) on delete set null,
  driver_name text,
  driver_email text,
  driver_phone text,
  vehicle text,
  status text default 'Pending Admin Approval',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.taxi_driver_applications enable row level security;
alter table public.taxi_ride_requests enable row level security;

create policy if not exists taxi_driver_apps_select_own_or_admin
on public.taxi_driver_applications for select
using (auth.email() = email or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin')));

create policy if not exists taxi_driver_apps_insert_own
on public.taxi_driver_applications for insert
with check (auth.email() = email);

create policy if not exists taxi_driver_apps_update_admin
on public.taxi_driver_applications for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin')));

create policy if not exists taxi_rides_select_related_or_admin
on public.taxi_ride_requests for select
using (auth.email() = rider_email or auth.email() = driver_email or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin')));

create policy if not exists taxi_rides_insert_rider
on public.taxi_ride_requests for insert
with check (auth.email() = rider_email);

create policy if not exists taxi_rides_update_related_or_admin
on public.taxi_ride_requests for update
using (auth.email() = rider_email or auth.email() = driver_email or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin')));
