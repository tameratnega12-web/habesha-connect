-- Habesha Agenagn V7.8.353
-- Business Directory owner save -> Admin approval -> customer visibility alignment.
-- Safe to run more than once.
--
-- The application uses its own role/profile UI while requests may reach
-- PostgREST as either anon or authenticated. These policies match that
-- existing application architecture so Admin approval is saved in Supabase
-- and approved profiles are returned to customers on every device.

begin;

create extension if not exists pgcrypto;

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  business_name text not null default 'Business',
  business_type text not null default 'Other',
  record_type text not null default 'business_profile',
  period text,
  record_date date default current_date,
  income_amount numeric(12,2) not null default 0,
  expense_amount numeric(12,2) not null default 0,
  amount numeric(12,2) not null default 0,
  notes text,
  owner_email text,
  owner_id text,
  status text not null default 'Pending Admin Approval',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_records add column if not exists local_ref text;
alter table public.business_records add column if not exists business_name text default 'Business';
alter table public.business_records add column if not exists business_type text default 'Other';
alter table public.business_records add column if not exists record_type text default 'business_profile';
alter table public.business_records add column if not exists period text;
alter table public.business_records add column if not exists record_date date default current_date;
alter table public.business_records add column if not exists income_amount numeric(12,2) default 0;
alter table public.business_records add column if not exists expense_amount numeric(12,2) default 0;
alter table public.business_records add column if not exists amount numeric(12,2) default 0;
alter table public.business_records add column if not exists notes text;
alter table public.business_records add column if not exists owner_email text;
alter table public.business_records add column if not exists owner_id text;
alter table public.business_records add column if not exists status text default 'Pending Admin Approval';
alter table public.business_records add column if not exists details jsonb default '{}'::jsonb;
alter table public.business_records add column if not exists created_at timestamptz default now();
alter table public.business_records add column if not exists updated_at timestamptz default now();

create unique index if not exists business_records_local_ref_uidx
  on public.business_records(local_ref)
  where local_ref is not null;
create index if not exists business_records_profile_status_idx
  on public.business_records(record_type, status);
create index if not exists business_records_owner_email_idx
  on public.business_records(lower(owner_email));

alter table public.business_records enable row level security;

grant select, insert, update, delete on table public.business_records to anon, authenticated;

-- Remove older policies that conflict with this project's custom-role access pattern.
drop policy if exists "Public can view approved business profiles" on public.business_records;
drop policy if exists "business_records_select_all" on public.business_records;
drop policy if exists "business_records_insert_all" on public.business_records;
drop policy if exists "business_records_update_all" on public.business_records;
drop policy if exists "business_records_delete_all" on public.business_records;
drop policy if exists "business records authenticated read" on public.business_records;
drop policy if exists "business records authenticated insert" on public.business_records;
drop policy if exists "business records authenticated update" on public.business_records;
drop policy if exists "business records authenticated delete" on public.business_records;

-- Admin, owner and customer screens all load from this same table. The app itself
-- displays only Approved profiles to customers and keeps pending records in Admin/Owner views.
create policy "business_records_select_all"
on public.business_records for select
to anon, authenticated
using (true);

create policy "business_records_insert_all"
on public.business_records for insert
to anon, authenticated
with check (record_type = 'business_profile');

create policy "business_records_update_all"
on public.business_records for update
to anon, authenticated
using (record_type = 'business_profile')
with check (record_type = 'business_profile');

create policy "business_records_delete_all"
on public.business_records for delete
to anon, authenticated
using (record_type = 'business_profile');

-- Normalize old status spellings so the customer filter sees all previously approved profiles.
update public.business_records
set status = 'Approved',
    details = jsonb_set(coalesce(details,'{}'::jsonb), '{status}', '"Approved"'::jsonb, true),
    updated_at = now()
where record_type = 'business_profile'
  and lower(trim(coalesce(status,''))) in ('approved','active','public','open');

-- Keep the top-level status and details.status synchronized for existing rows.
update public.business_records
set details = jsonb_set(coalesce(details,'{}'::jsonb), '{status}', to_jsonb(status), true),
    updated_at = now()
where record_type = 'business_profile'
  and coalesce(details->>'status','') is distinct from coalesce(status,'');

commit;
