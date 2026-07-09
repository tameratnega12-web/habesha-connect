-- Habesha Agenagn V7.8.76
-- Business Directory Admin Visibility Fix
-- Run this if Admin does not see pending Business Directory profiles.

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  local_ref text,
  business_name text,
  business_type text,
  record_type text default 'business_profile',
  period text,
  record_date date,
  income_amount numeric default 0,
  expense_amount numeric default 0,
  amount numeric default 0,
  notes text,
  owner_email text,
  owner_id text,
  status text default 'Pending Admin Approval',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.business_records add column if not exists local_ref text;
alter table public.business_records add column if not exists business_name text;
alter table public.business_records add column if not exists business_type text;
alter table public.business_records add column if not exists record_type text default 'business_profile';
alter table public.business_records add column if not exists owner_email text;
alter table public.business_records add column if not exists owner_id text;
alter table public.business_records add column if not exists status text default 'Pending Admin Approval';
alter table public.business_records add column if not exists details jsonb default '{}'::jsonb;
alter table public.business_records add column if not exists updated_at timestamptz default now();

create unique index if not exists business_records_local_ref_uidx on public.business_records(local_ref) where local_ref is not null;
create index if not exists business_records_type_status_idx on public.business_records(record_type,status);
create index if not exists business_records_owner_email_idx on public.business_records(owner_email);

alter table public.business_records enable row level security;

-- Replace old conflicting policies for this table.
drop policy if exists "business_records_select_all_authenticated" on public.business_records;
drop policy if exists "business_records_insert_authenticated" on public.business_records;
drop policy if exists "business_records_update_owner_or_admin" on public.business_records;
drop policy if exists "business_records_delete_owner_or_admin" on public.business_records;

-- Authenticated users can read business profiles so Admin can review pending listings
-- and customers can see approved listings through app filtering.
create policy "business_records_select_all_authenticated"
on public.business_records
for select
to authenticated
using (true);

-- Owners can submit their own business profiles.
create policy "business_records_insert_authenticated"
on public.business_records
for insert
to authenticated
with check (auth.uid() is not null);

-- Owners and admin can update records. Admin is identified by profiles.role='admin'
-- or profiles.email matching the authenticated user's email.
create policy "business_records_update_owner_or_admin"
on public.business_records
for update
to authenticated
using (
  lower(coalesce(owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or lower(coalesce(p.email,'')) = lower(coalesce(auth.jwt()->>'email','')) and p.role = 'admin')
  )
)
with check (
  lower(coalesce(owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or lower(coalesce(p.email,'')) = lower(coalesce(auth.jwt()->>'email','')) and p.role = 'admin')
  )
);

create policy "business_records_delete_owner_or_admin"
on public.business_records
for delete
to authenticated
using (
  lower(coalesce(owner_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or lower(coalesce(p.email,'')) = lower(coalesce(auth.jwt()->>'email','')) and p.role = 'admin')
  )
);
