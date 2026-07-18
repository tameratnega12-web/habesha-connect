-- V7.8.347 Taxi/Limo driver application RLS alignment
-- Fixes: new row violates row-level security policy for taxi_driver_applications
-- The current app uses its own signed-in user record while Supabase requests may run
-- with either the anon or authenticated API role. Match the working project tables.

alter table public.taxi_driver_applications enable row level security;

grant select, insert, update, delete on table public.taxi_driver_applications to anon, authenticated;

-- Remove both the original V7.8.216 names and any prior replacement names.
drop policy if exists taxi_driver_applications_select_all on public.taxi_driver_applications;
drop policy if exists taxi_driver_applications_insert_auth on public.taxi_driver_applications;
drop policy if exists taxi_driver_applications_update_auth on public.taxi_driver_applications;
drop policy if exists taxi_driver_applications_delete_auth on public.taxi_driver_applications;
drop policy if exists "taxi driver applications read" on public.taxi_driver_applications;
drop policy if exists "taxi driver applications insert" on public.taxi_driver_applications;
drop policy if exists "taxi driver applications update" on public.taxi_driver_applications;
drop policy if exists "taxi driver applications delete" on public.taxi_driver_applications;

create policy "taxi driver applications read"
on public.taxi_driver_applications
for select
to anon, authenticated
using (true);

create policy "taxi driver applications insert"
on public.taxi_driver_applications
for insert
to anon, authenticated
with check (
  coalesce(trim(full_name), '') <> ''
  and coalesce(trim(email), '') <> ''
  and coalesce(trim(license_number), '') <> ''
  and coalesce(trim(experience), '') <> ''
  and coalesce(trim(availability), '') <> ''
  and coalesce(trim(service_area), '') <> ''
  and coalesce(status, 'pending') in ('pending', 'pending_admin')
);

create policy "taxi driver applications update"
on public.taxi_driver_applications
for update
to anon, authenticated
using (true)
with check (true);

create policy "taxi driver applications delete"
on public.taxi_driver_applications
for delete
to anon, authenticated
using (true);
