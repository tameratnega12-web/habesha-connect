-- Habesha Connect V7.8.80 Business Directory Flow
-- Run this in Supabase SQL Editor if your Business Directory table is missing or approval does not stay saved.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  business_name text,
  business_type text,
  record_type text default 'business_profile',
  period text default 'Directory',
  record_date date default current_date,
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
alter table public.business_records add column if not exists period text default 'Directory';
alter table public.business_records add column if not exists record_date date default current_date;
alter table public.business_records add column if not exists income_amount numeric default 0;
alter table public.business_records add column if not exists expense_amount numeric default 0;
alter table public.business_records add column if not exists amount numeric default 0;
alter table public.business_records add column if not exists notes text;
alter table public.business_records add column if not exists owner_email text;
alter table public.business_records add column if not exists owner_id text;
alter table public.business_records add column if not exists status text default 'Pending Admin Approval';
alter table public.business_records add column if not exists details jsonb default '{}'::jsonb;
alter table public.business_records add column if not exists created_at timestamptz default now();
alter table public.business_records add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'business_records_local_ref_key'
  ) then
    alter table public.business_records add constraint business_records_local_ref_key unique (local_ref);
  end if;
end $$;

create index if not exists business_records_record_type_idx on public.business_records(record_type);
create index if not exists business_records_status_idx on public.business_records(status);
create index if not exists business_records_owner_email_idx on public.business_records(lower(owner_email));

alter table public.business_records enable row level security;

drop policy if exists "business_records_select_all" on public.business_records;
drop policy if exists "business_records_insert_auth" on public.business_records;
drop policy if exists "business_records_update_auth" on public.business_records;
drop policy if exists "business_records_delete_auth" on public.business_records;

create policy "business_records_select_all"
on public.business_records for select
using (true);

create policy "business_records_insert_auth"
on public.business_records for insert
to authenticated
with check (true);

create policy "business_records_update_auth"
on public.business_records for update
to authenticated
using (true)
with check (true);

create policy "business_records_delete_auth"
on public.business_records for delete
to authenticated
using (true);
