-- Habesha Agenagn V7.8.236 Business Profile + Business Manager foundation
-- Run once in Supabase SQL Editor after deploying V7.8.236.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.business_features (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_records(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, feature_key)
);

create table if not exists public.business_employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_records(id) on delete cascade,
  employee_name text not null,
  employee_email text,
  employee_phone text,
  job_title text,
  preferred_language text,
  hourly_rate numeric(12,2) not null default 0,
  status text not null default 'Active' check (status in ('Active','Inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_time_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_records(id) on delete cascade,
  employee_id uuid not null references public.business_employees(id) on delete cascade,
  employee_email text,
  work_date date not null default current_date,
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  status text not null default 'Open' check (status in ('Open','Completed','Approved')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_records(id) on delete cascade,
  employee_id uuid not null references public.business_employees(id) on delete cascade,
  employee_email text,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  role_duty text,
  status text not null default 'Scheduled' check (status in ('Scheduled','Confirmed','Completed','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_features_business_idx on public.business_features(business_id);
create index if not exists business_employees_business_idx on public.business_employees(business_id);
create index if not exists business_employees_email_idx on public.business_employees(lower(employee_email));
create index if not exists business_time_entries_business_idx on public.business_time_entries(business_id);
create index if not exists business_time_entries_employee_idx on public.business_time_entries(employee_id, work_date desc);
create index if not exists business_schedules_business_idx on public.business_schedules(business_id, shift_date);
create index if not exists business_schedules_employee_idx on public.business_schedules(employee_id, shift_date);

alter table public.business_features enable row level security;
alter table public.business_employees enable row level security;
alter table public.business_time_entries enable row level security;
alter table public.business_schedules enable row level security;

-- Helper expression used in policies: authenticated email from JWT.

drop policy if exists "business_features_owner_all" on public.business_features;
create policy "business_features_owner_all" on public.business_features
for all to authenticated
using (exists (
  select 1 from public.business_records b
  where b.id = business_features.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
))
with check (exists (
  select 1 from public.business_records b
  where b.id = business_features.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
));

drop policy if exists "business_employees_owner_all" on public.business_employees;
create policy "business_employees_owner_all" on public.business_employees
for all to authenticated
using (exists (
  select 1 from public.business_records b
  where b.id = business_employees.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
))
with check (exists (
  select 1 from public.business_records b
  where b.id = business_employees.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
));

drop policy if exists "business_employees_employee_read" on public.business_employees;
create policy "business_employees_employee_read" on public.business_employees
for select to authenticated
using (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "business_time_owner_all" on public.business_time_entries;
create policy "business_time_owner_all" on public.business_time_entries
for all to authenticated
using (exists (
  select 1 from public.business_records b
  where b.id = business_time_entries.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
))
with check (exists (
  select 1 from public.business_records b
  where b.id = business_time_entries.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
));

drop policy if exists "business_time_employee_read" on public.business_time_entries;
create policy "business_time_employee_read" on public.business_time_entries
for select to authenticated
using (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "business_time_employee_insert" on public.business_time_entries;
create policy "business_time_employee_insert" on public.business_time_entries
for insert to authenticated
with check (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "business_time_employee_update" on public.business_time_entries;
create policy "business_time_employee_update" on public.business_time_entries
for update to authenticated
using (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')))
with check (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "business_schedule_owner_all" on public.business_schedules;
create policy "business_schedule_owner_all" on public.business_schedules
for all to authenticated
using (exists (
  select 1 from public.business_records b
  where b.id = business_schedules.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
))
with check (exists (
  select 1 from public.business_records b
  where b.id = business_schedules.business_id
    and lower(coalesce(b.owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
));

drop policy if exists "business_schedule_employee_read" on public.business_schedules;
create policy "business_schedule_employee_read" on public.business_schedules
for select to authenticated
using (lower(coalesce(employee_email,'')) = lower(coalesce(auth.jwt()->>'email','')));

-- Default feature choices are inserted by the app per business.
