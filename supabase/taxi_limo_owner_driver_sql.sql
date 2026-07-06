-- Habesha Connect Taxi/Limo Owner + Driver SQL
-- Run in Supabase SQL Editor as a new snippet. Do not delete old SQL.

-- Owner applications / companies
create table if not exists taxi_limo_owners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  owner_name text,
  owner_email text not null,
  phone text,
  company_name text not null,
  city text,
  status text not null default 'pending_admin'
    check (status in ('pending_admin','approved','declined','suspended')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vehicles owned by Taxi/Limo owners
create table if not exists taxi_limo_vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  owner_email text not null,
  company_name text,
  vehicle_type text default 'Taxi' check (vehicle_type in ('Taxi','Limo','SUV','Van','Other')),
  make text not null,
  model text not null,
  year text,
  plate_number text,
  vin text,
  color text,
  insurance_url text,
  registration_url text,
  vehicle_photo_url text,
  docs_note text,
  status text not null default 'pending_admin'
    check (status in ('pending_admin','approved','declined','inactive','suspended')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add owner/company fields to the existing taxi driver application table if it exists.
alter table if exists taxi_driver_applications
  add column if not exists owner_application_id uuid references taxi_limo_owners(id) on delete set null,
  add column if not exists owner_email text,
  add column if not exists company_name text,
  add column if not exists assigned_vehicle_id uuid references taxi_limo_vehicles(id) on delete set null,
  add column if not exists assigned_vehicle_label text;

-- Owner assigns approved drivers to approved vehicles. Admin approves assignment.
create table if not exists taxi_limo_driver_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  owner_email text not null,
  driver_id uuid references auth.users(id) on delete cascade,
  driver_email text not null,
  driver_name text,
  vehicle_id uuid references taxi_limo_vehicles(id) on delete cascade,
  vehicle_label text,
  status text not null default 'pending_admin'
    check (status in ('pending_admin','approved','declined','ended')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (driver_email, vehicle_id)
);

-- Optional: connect ride requests to owner/company/vehicle after driver accepts.
alter table if exists taxi_ride_requests
  add column if not exists owner_application_id uuid references taxi_limo_owners(id) on delete set null,
  add column if not exists owner_email text,
  add column if not exists company_name text,
  add column if not exists vehicle_id uuid references taxi_limo_vehicles(id) on delete set null,
  add column if not exists vehicle_label text;

-- Helpful indexes
create index if not exists taxi_limo_owners_email_idx on taxi_limo_owners(owner_email);
create index if not exists taxi_limo_owners_status_idx on taxi_limo_owners(status);
create index if not exists taxi_limo_vehicles_owner_email_idx on taxi_limo_vehicles(owner_email);
create index if not exists taxi_limo_vehicles_status_idx on taxi_limo_vehicles(status);
create index if not exists taxi_limo_assign_owner_email_idx on taxi_limo_driver_assignments(owner_email);
create index if not exists taxi_limo_assign_driver_email_idx on taxi_limo_driver_assignments(driver_email);
create index if not exists taxi_limo_assign_status_idx on taxi_limo_driver_assignments(status);

-- Enable Row Level Security
alter table taxi_limo_owners enable row level security;
alter table taxi_limo_vehicles enable row level security;
alter table taxi_limo_driver_assignments enable row level security;

-- Helper admin check uses profiles table if your profiles table stores role/admin roles.
-- If your admin dashboard uses a different admin method, keep using your current admin logic.

-- Owners policies
create policy "Taxi limo owners can create own application"
on taxi_limo_owners for insert to authenticated
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email');

create policy "Taxi limo owners can view own application"
on taxi_limo_owners for select to authenticated
using (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));

create policy "Taxi limo owners can update own pending application"
on taxi_limo_owners for update to authenticated
using (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))))
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));

-- Vehicle policies
create policy "Taxi limo owners can create vehicles"
on taxi_limo_vehicles for insert to authenticated
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email');

create policy "Users can view approved taxi limo vehicles"
on taxi_limo_vehicles for select to authenticated
using (status = 'approved' or auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));

create policy "Taxi limo owners can update own vehicles"
on taxi_limo_vehicles for update to authenticated
using (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))))
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));

-- Assignment policies
create policy "Taxi limo owners can create driver assignments"
on taxi_limo_driver_assignments for insert to authenticated
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email');

create policy "Owners and drivers can view assignments"
on taxi_limo_driver_assignments for select to authenticated
using (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or driver_id = auth.uid() or driver_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));

create policy "Owners and admins can update assignments"
on taxi_limo_driver_assignments for update to authenticated
using (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))))
with check (auth.uid() = owner_id or owner_email = auth.jwt()->>'email' or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role = 'admin' or p.active_role = 'admin' or 'admin' = any(p.roles))));
