-- V7.8.352 Business Directory customer visibility fix
-- Allows visitors and signed-in users to read only approved public business profiles.
-- Existing owner/admin policies remain unchanged.

alter table public.business_records enable row level security;

grant select on table public.business_records to anon, authenticated;

drop policy if exists "Public can view approved business profiles" on public.business_records;
create policy "Public can view approved business profiles"
on public.business_records
for select
to anon, authenticated
using (
  record_type = 'business_profile'
  and lower(trim(coalesce(status, ''))) in ('approved', 'active', 'public', 'open')
);
