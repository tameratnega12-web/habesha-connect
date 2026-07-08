-- Habesha Connect V7.8.32 Taxi/Limo Clean Supabase Sync
-- Run in Supabase SQL Editor. Do not delete old SQL.
-- Purpose: make Taxi/Limo owner, vehicle, driver, and hire approvals save/read from Supabase only.

-- Owner applications / companies
create table if not exists taxi_limo_owners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text,
  owner_email text not null,
  phone text,
  company_name text not null,
  city text,
  status text not null default 'pending_admin',
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table taxi_limo_owners
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists owner_name text,
  add column if not exists owner_email text,
  add column if not exists phone text,
  add column if not exists company_name text,
  add column if not exists city text,
  add column if not exists status text default 'pending_admin',
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz default now();

alter table taxi_limo_owners drop constraint if exists taxi_limo_owners_status_check;
alter table taxi_limo_owners add constraint taxi_limo_owners_status_check
  check (status in ('pending_admin','approved','declined','suspended'));

-- Vehicles
create table if not exists taxi_limo_vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  owner_email text not null,
  company_name text,
  vehicle_type text default 'Taxi',
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
  status text not null default 'pending_admin',
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table taxi_limo_vehicles
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  add column if not exists owner_email text,
  add column if not exists company_name text,
  add column if not exists vehicle_type text default 'Taxi',
  add column if not exists make text,
  add column if not exists model text,
  add column if not exists year text,
  add column if not exists plate_number text,
  add column if not exists docs_note text,
  add column if not exists status text default 'pending_admin',
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz default now();

alter table taxi_limo_vehicles drop constraint if exists taxi_limo_vehicles_status_check;
alter table taxi_limo_vehicles add constraint taxi_limo_vehicles_status_check
  check (status in ('pending_admin','approved','declined','inactive','suspended'));

-- Driver applications. Driver does not enter vehicle info.
create table if not exists taxi_driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text,
  email text,
  phone text,
  license_number text,
  experience text,
  availability text,
  service_area text,
  driver_notes text,
  status text not null default 'pending',
  owner_email text,
  assigned_vehicle_id text,
  assigned_vehicle_label text,
  availability_status text default 'Available',
  admin_note text,
  created_at timestamptz default now()
);

alter table taxi_driver_applications
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists license_number text,
  add column if not exists experience text,
  add column if not exists availability text,
  add column if not exists service_area text,
  add column if not exists driver_notes text,
  add column if not exists status text default 'pending',
  add column if not exists owner_email text,
  add column if not exists assigned_vehicle_id text,
  add column if not exists assigned_vehicle_label text,
  add column if not exists availability_status text default 'Available',
  add column if not exists admin_note text;

alter table taxi_driver_applications drop constraint if exists taxi_driver_applications_status_check;
alter table taxi_driver_applications add constraint taxi_driver_applications_status_check
  check (status in ('pending','approved','declined','suspended'));

-- Owner-driver hire requests
create table if not exists taxi_limo_driver_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  owner_email text not null,
  driver_id uuid references auth.users(id) on delete set null,
  driver_email text not null,
  driver_name text,
  vehicle_id uuid references taxi_limo_vehicles(id) on delete set null,
  vehicle_label text,
  status text not null default 'waiting_driver_acceptance',
  driver_response text,
  driver_responded_at timestamptz,
  hired_at timestamptz,
  ended_at timestamptz,
  ended_by text,
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table taxi_limo_driver_assignments
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists owner_application_id uuid references taxi_limo_owners(id) on delete cascade,
  add column if not exists owner_email text,
  add column if not exists driver_email text,
  add column if not exists driver_name text,
  add column if not exists vehicle_id uuid references taxi_limo_vehicles(id) on delete set null,
  add column if not exists vehicle_label text,
  add column if not exists status text default 'waiting_driver_acceptance',
  add column if not exists driver_response text,
  add column if not exists driver_responded_at timestamptz,
  add column if not exists hired_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists ended_by text,
  add column if not exists updated_at timestamptz default now();

alter table taxi_limo_driver_assignments drop constraint if exists taxi_limo_driver_assignments_status_check;
alter table taxi_limo_driver_assignments add constraint taxi_limo_driver_assignments_status_check
  check (status in ('waiting_driver_acceptance','pending_driver_acceptance','driver_accepted_pending_admin','pending_admin','approved','driver_declined','declined','ended'));

create index if not exists taxi_limo_owners_email_idx on taxi_limo_owners(owner_email);
create index if not exists taxi_limo_owners_status_idx on taxi_limo_owners(status);
create index if not exists taxi_limo_vehicles_owner_email_idx on taxi_limo_vehicles(owner_email);
create index if not exists taxi_limo_vehicles_status_idx on taxi_limo_vehicles(status);
create index if not exists taxi_driver_applications_email_idx on taxi_driver_applications(email);
create index if not exists taxi_driver_applications_status_idx on taxi_driver_applications(status);
create index if not exists taxi_driver_applications_owner_email_idx on taxi_driver_applications(owner_email);
create index if not exists taxi_limo_assign_owner_email_idx on taxi_limo_driver_assignments(owner_email);
create index if not exists taxi_limo_assign_driver_email_idx on taxi_limo_driver_assignments(driver_email);
create index if not exists taxi_limo_assign_status_idx on taxi_limo_driver_assignments(status);

alter table taxi_limo_owners enable row level security;
alter table taxi_limo_vehicles enable row level security;
alter table taxi_driver_applications enable row level security;
alter table taxi_limo_driver_assignments enable row level security;

-- Replace policies safely
drop policy if exists "Taxi limo owners all access" on taxi_limo_owners;
drop policy if exists "Taxi limo vehicles all access" on taxi_limo_vehicles;
drop policy if exists "Taxi limo drivers all access" on taxi_driver_applications;
drop policy if exists "Taxi limo assignments all access" on taxi_limo_driver_assignments;

-- Broad authenticated policies used by the app's own admin/role logic.
-- This avoids the dashboard hiding approvals because of RLS while still blocking anonymous public access.
create policy "Taxi limo owners all access"
  on taxi_limo_owners for all to authenticated
  using (true) with check (true);

create policy "Taxi limo vehicles all access"
  on taxi_limo_vehicles for all to authenticated
  using (true) with check (true);

create policy "Taxi limo drivers all access"
  on taxi_driver_applications for all to authenticated
  using (true) with check (true);

create policy "Taxi limo assignments all access"
  on taxi_limo_driver_assignments for all to authenticated
  using (true) with check (true);
