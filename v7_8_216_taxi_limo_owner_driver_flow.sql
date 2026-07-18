-- Habesha Agenagn V7.8.216 Taxi/Limo Owner, Vehicle, Driver and Hiring Flow
-- Run once in Supabase SQL Editor before testing Taxi/Limo owner approval.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.taxi_limo_owners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  owner_name text,
  owner_email text not null,
  phone text,
  company_name text,
  city text,
  status text not null default 'pending_admin',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taxi_limo_owners add column if not exists owner_id uuid;
alter table public.taxi_limo_owners add column if not exists owner_name text;
alter table public.taxi_limo_owners add column if not exists owner_email text;
alter table public.taxi_limo_owners add column if not exists phone text;
alter table public.taxi_limo_owners add column if not exists company_name text;
alter table public.taxi_limo_owners add column if not exists city text;
alter table public.taxi_limo_owners add column if not exists status text default 'pending_admin';
alter table public.taxi_limo_owners add column if not exists admin_note text;
alter table public.taxi_limo_owners add column if not exists created_at timestamptz default now();
alter table public.taxi_limo_owners add column if not exists updated_at timestamptz default now();

create unique index if not exists taxi_limo_owners_email_unique_idx on public.taxi_limo_owners(lower(owner_email));
create index if not exists taxi_limo_owners_status_idx on public.taxi_limo_owners(status);

create table if not exists public.taxi_limo_vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  owner_application_id uuid,
  owner_name text,
  owner_email text not null,
  company_name text,
  vehicle_type text,
  make text,
  model text,
  year text,
  plate_number text,
  docs_note text,
  status text not null default 'pending_admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taxi_limo_vehicles add column if not exists owner_id uuid;
alter table public.taxi_limo_vehicles add column if not exists owner_application_id uuid;
alter table public.taxi_limo_vehicles add column if not exists owner_name text;
alter table public.taxi_limo_vehicles add column if not exists owner_email text;
alter table public.taxi_limo_vehicles add column if not exists company_name text;
alter table public.taxi_limo_vehicles add column if not exists vehicle_type text;
alter table public.taxi_limo_vehicles add column if not exists make text;
alter table public.taxi_limo_vehicles add column if not exists model text;
alter table public.taxi_limo_vehicles add column if not exists year text;
alter table public.taxi_limo_vehicles add column if not exists plate_number text;
alter table public.taxi_limo_vehicles add column if not exists docs_note text;
alter table public.taxi_limo_vehicles add column if not exists status text default 'pending_admin';
alter table public.taxi_limo_vehicles add column if not exists created_at timestamptz default now();
alter table public.taxi_limo_vehicles add column if not exists updated_at timestamptz default now();

create index if not exists taxi_limo_vehicles_owner_email_idx on public.taxi_limo_vehicles(lower(owner_email));
create index if not exists taxi_limo_vehicles_status_idx on public.taxi_limo_vehicles(status);

create table if not exists public.taxi_driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text,
  email text not null,
  phone text,
  license_number text,
  experience text,
  availability text,
  service_area text,
  driver_notes text,
  status text not null default 'pending',
  owner_email text,
  assigned_vehicle_id uuid,
  assigned_vehicle_label text,
  availability_status text default 'Available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taxi_driver_applications add column if not exists user_id uuid;
alter table public.taxi_driver_applications add column if not exists full_name text;
alter table public.taxi_driver_applications add column if not exists email text;
alter table public.taxi_driver_applications add column if not exists phone text;
alter table public.taxi_driver_applications add column if not exists license_number text;
alter table public.taxi_driver_applications add column if not exists experience text;
alter table public.taxi_driver_applications add column if not exists availability text;
alter table public.taxi_driver_applications add column if not exists service_area text;
alter table public.taxi_driver_applications add column if not exists driver_notes text;
alter table public.taxi_driver_applications add column if not exists status text default 'pending';
alter table public.taxi_driver_applications add column if not exists owner_email text;
alter table public.taxi_driver_applications add column if not exists assigned_vehicle_id uuid;
alter table public.taxi_driver_applications add column if not exists assigned_vehicle_label text;
alter table public.taxi_driver_applications add column if not exists availability_status text default 'Available';
alter table public.taxi_driver_applications add column if not exists created_at timestamptz default now();
alter table public.taxi_driver_applications add column if not exists updated_at timestamptz default now();

create unique index if not exists taxi_driver_applications_email_unique_idx on public.taxi_driver_applications(lower(email));
create index if not exists taxi_driver_applications_status_idx on public.taxi_driver_applications(status);

create table if not exists public.taxi_limo_driver_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  owner_application_id uuid,
  owner_name text,
  owner_email text not null,
  driver_email text not null,
  driver_name text,
  vehicle_id uuid,
  vehicle_label text,
  status text not null default 'waiting_driver_acceptance',
  driver_responded_at timestamptz,
  hired_at timestamptz,
  ended_at timestamptz,
  ended_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taxi_limo_driver_assignments add column if not exists owner_id uuid;
alter table public.taxi_limo_driver_assignments add column if not exists owner_application_id uuid;
alter table public.taxi_limo_driver_assignments add column if not exists owner_name text;
alter table public.taxi_limo_driver_assignments add column if not exists owner_email text;
alter table public.taxi_limo_driver_assignments add column if not exists driver_email text;
alter table public.taxi_limo_driver_assignments add column if not exists driver_name text;
alter table public.taxi_limo_driver_assignments add column if not exists vehicle_id uuid;
alter table public.taxi_limo_driver_assignments add column if not exists vehicle_label text;
alter table public.taxi_limo_driver_assignments add column if not exists status text default 'waiting_driver_acceptance';
alter table public.taxi_limo_driver_assignments add column if not exists driver_responded_at timestamptz;
alter table public.taxi_limo_driver_assignments add column if not exists hired_at timestamptz;
alter table public.taxi_limo_driver_assignments add column if not exists ended_at timestamptz;
alter table public.taxi_limo_driver_assignments add column if not exists ended_by text;
alter table public.taxi_limo_driver_assignments add column if not exists created_at timestamptz default now();
alter table public.taxi_limo_driver_assignments add column if not exists updated_at timestamptz default now();

create index if not exists taxi_limo_assignments_owner_email_idx on public.taxi_limo_driver_assignments(lower(owner_email));
create index if not exists taxi_limo_assignments_driver_email_idx on public.taxi_limo_driver_assignments(lower(driver_email));
create index if not exists taxi_limo_assignments_status_idx on public.taxi_limo_driver_assignments(status);

alter table public.taxi_limo_owners enable row level security;
alter table public.taxi_limo_vehicles enable row level security;
alter table public.taxi_driver_applications enable row level security;
alter table public.taxi_limo_driver_assignments enable row level security;

-- The app performs role checks in its Admin UI. These policies match the existing project pattern.
do $$
declare
  t text;
begin
  foreach t in array array['taxi_limo_owners','taxi_limo_vehicles','taxi_driver_applications','taxi_limo_driver_assignments']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_auth', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_auth', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_auth', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_select_all', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (true)', t || '_insert_auth', t);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true)', t || '_update_auth', t);
    execute format('create policy %I on public.%I for delete to authenticated using (true)', t || '_delete_auth', t);
  end loop;
end $$;
