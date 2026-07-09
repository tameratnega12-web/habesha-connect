-- V7.8.83 Business Directory Admin Email / Approval Visibility Fix
-- Run once in Supabase SQL Editor.

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  local_ref text,
  business_name text,
  business_type text,
  record_type text default 'business_profile',
  period text,
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
alter table public.business_records add column if not exists period text;
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

create unique index if not exists business_records_local_ref_idx on public.business_records(local_ref) where local_ref is not null;
create index if not exists business_records_record_type_idx on public.business_records(record_type);
create index if not exists business_records_status_idx on public.business_records(status);
create index if not exists business_records_owner_email_idx on public.business_records(owner_email);

alter table public.business_records enable row level security;

drop policy if exists "business_records_select_all" on public.business_records;
drop policy if exists "business_records_insert_authenticated" on public.business_records;
drop policy if exists "business_records_update_authenticated" on public.business_records;
drop policy if exists "business_records_delete_authenticated" on public.business_records;

create policy "business_records_select_all"
on public.business_records for select
to anon, authenticated
using (true);

create policy "business_records_insert_authenticated"
on public.business_records for insert
to authenticated
with check (true);

create policy "business_records_update_authenticated"
on public.business_records for update
to authenticated
using (true)
with check (true);

create policy "business_records_delete_authenticated"
on public.business_records for delete
to authenticated
using (true);

-- Normalize older business profile rows so Admin can see them.
update public.business_records
set record_type='business_profile'
where (record_type is null or record_type='') and business_name is not null;

update public.business_records
set status=coalesce(nullif(status,''),'Pending Admin Approval')
where business_name is not null;
