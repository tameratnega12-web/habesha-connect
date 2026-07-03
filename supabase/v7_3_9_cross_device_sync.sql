-- Habesha Agenagn V7.3.9 Cross-device sync tables for trucking
-- Run once in Supabase SQL Editor before testing trucking from phone/laptop.

create table if not exists public.truck_records (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  truck text not null,
  plate text,
  vin text,
  driver_name text,
  driver_email text,
  insurance_expiration date,
  registration_expiration date,
  maintenance_notes text,
  status text default 'Available',
  income numeric default 0,
  expenses numeric default 0,
  mileage numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.truck_jobs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  route text,
  pay text,
  schedule text,
  requirements text,
  truck_details text,
  status text default 'Pending Admin Approval',
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.truck_driver_profiles (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references public.profiles(id) on delete cascade,
  driver_name text,
  driver_email text unique not null,
  phone text,
  city text,
  license text,
  experience text,
  looking text,
  notes text,
  updated_at timestamptz default now()
);

create table if not exists public.truck_applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.truck_jobs(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete cascade,
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
  owner_decision_at timestamptz,
  created_at timestamptz default now(),
  unique(job_id, driver_email)
);

alter table public.truck_records enable row level security;
alter table public.truck_jobs enable row level security;
alter table public.truck_driver_profiles enable row level security;
alter table public.truck_applications enable row level security;

do $$ begin
  create policy "temporary all truck_records" on public.truck_records for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all truck_jobs" on public.truck_jobs for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all truck_driver_profiles" on public.truck_driver_profiles for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all truck_applications" on public.truck_applications for all using (true) with check (true);
exception when duplicate_object then null; end $$;
