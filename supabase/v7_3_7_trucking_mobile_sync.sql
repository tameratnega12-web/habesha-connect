-- Habesha Agenagn V7.3.7 Trucking Mobile Sync Fix
-- Adds shared Supabase tables used only by the Trucking module.
-- Existing Shipping, Rentals, Marketplace, Business, Admin, and Auth tables are not changed.

create table if not exists public.trucking_jobs (
  id uuid primary key default uuid_generate_v4(),
  local_ref text unique,
  owner_name text,
  owner_email text,
  owner_phone text,
  title text not null,
  route text,
  pay text,
  schedule text,
  requirements text,
  truck_details text,
  status text default 'Pending Admin Approval',
  hired_driver_name text,
  hired_driver_email text,
  approved_at timestamptz,
  hired_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.trucking_driver_profiles (
  id uuid primary key default uuid_generate_v4(),
  driver_email text unique not null,
  name text,
  phone text,
  city text,
  license text,
  experience text,
  looking text,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.trucking_applications (
  id uuid primary key default uuid_generate_v4(),
  local_ref text unique,
  job_id uuid references public.trucking_jobs(id) on delete cascade,
  job_local_ref text,
  job_title text,
  owner_name text,
  owner_email text,
  driver_name text,
  driver_email text,
  driver_phone text,
  city text,
  license text,
  experience text,
  looking text,
  notes text,
  status text default 'Pending Admin Approval',
  admin_approved_at timestamptz,
  approved_at timestamptz,
  hired_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.trucking_jobs enable row level security;
alter table public.trucking_driver_profiles enable row level security;
alter table public.trucking_applications enable row level security;

do $$ begin
  create policy "temporary all trucking_jobs" on public.trucking_jobs for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "temporary all trucking_driver_profiles" on public.trucking_driver_profiles for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "temporary all trucking_applications" on public.trucking_applications for all using (true) with check (true);
exception when duplicate_object then null; end $$;
