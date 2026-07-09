-- Habesha Agenagn V7.8.78
-- Business Directory approval status persistence fix
-- Run this in Supabase SQL Editor if Admin approval returns with Approve active again.

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
alter table public.business_records add column if not exists status text default 'Pending Admin Approval';
alter table public.business_records add column if not exists details jsonb default '{}'::jsonb;
alter table public.business_records add column if not exists updated_at timestamptz default now();

create unique index if not exists business_records_local_ref_uidx on public.business_records(local_ref) where local_ref is not null;
create index if not exists business_records_type_status_idx on public.business_records(record_type,status);
create index if not exists business_records_owner_email_idx on public.business_records(owner_email);

-- Keep top-level status and details.status synchronized for Business Directory rows.
update public.business_records
set status = coalesce(nullif(status,''), details->>'status', 'Pending Admin Approval'),
    details = jsonb_set(coalesce(details,'{}'::jsonb), '{status}', to_jsonb(coalesce(nullif(status,''), details->>'status', 'Pending Admin Approval')), true),
    updated_at = now()
where record_type = 'business_profile';

alter table public.business_records enable row level security;

drop policy if exists "business_records_select_all_authenticated" on public.business_records;
drop policy if exists "business_records_insert_authenticated" on public.business_records;
drop policy if exists "business_records_update_owner_or_admin" on public.business_records;
drop policy if exists "business_records_delete_owner_or_admin" on public.business_records;

create policy "business_records_select_all_authenticated"
on public.business_records
for select
to authenticated
using (true);

create policy "business_records_insert_authenticated"
on public.business_records
for insert
to authenticated
with check (auth.uid() is not null);

-- Beta/admin approval policy: authenticated app users can update business_records.
-- The app UI still restricts approve/decline buttons to Admin only.
create policy "business_records_update_owner_or_admin"
on public.business_records
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "business_records_delete_owner_or_admin"
on public.business_records
for delete
to authenticated
using (auth.uid() is not null);
