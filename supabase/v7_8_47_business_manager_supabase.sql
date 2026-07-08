-- V7.8.47 Business Directory Supabase table
-- Run this only if Business Directory shows a Supabase table/policy error.

create table if not exists public.business_records (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  owner_id text,
  owner_email text,
  business_name text,
  business_type text,
  record_type text,
  period text,
  record_date date,
  income_amount numeric default 0,
  expense_amount numeric default 0,
  amount numeric default 0,
  notes text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.business_records enable row level security;

drop policy if exists "business_records_select_owner" on public.business_records;
create policy "business_records_select_owner"
on public.business_records for select
using (auth.uid()::text = owner_id or auth.email() = owner_email);

drop policy if exists "business_records_insert_owner" on public.business_records;
create policy "business_records_insert_owner"
on public.business_records for insert
with check (auth.uid()::text = owner_id or auth.email() = owner_email);

drop policy if exists "business_records_update_owner" on public.business_records;
create policy "business_records_update_owner"
on public.business_records for update
using (auth.uid()::text = owner_id or auth.email() = owner_email)
with check (auth.uid()::text = owner_id or auth.email() = owner_email);

create index if not exists idx_business_records_owner_email on public.business_records(owner_email);
create index if not exists idx_business_records_owner_id on public.business_records(owner_id);
create index if not exists idx_business_records_record_type on public.business_records(record_type);
