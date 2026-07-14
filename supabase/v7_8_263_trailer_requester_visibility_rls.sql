-- V7.8.263 — Trailer rental requester visibility/agreement RLS fix only.
-- Run once in Supabase SQL Editor.
-- This adds access for the trailer owner and the selected requester without changing other modules.

alter table public.trailer_rentals enable row level security;

-- The selected requester must continue to receive the row after the owner accepts it.
drop policy if exists "trailer requester can read own request" on public.trailer_rentals;
create policy "trailer requester can read own request"
on public.trailer_rentals
for select
to authenticated
using (
  lower(coalesce(renter_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- The trailer owner must always be able to read their own listing/request row.
drop policy if exists "trailer owner can read own listing" on public.trailer_rentals;
create policy "trailer owner can read own listing"
on public.trailer_rentals
for select
to authenticated
using (
  lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- The selected requester must be able to save the Agree status on their own request.
drop policy if exists "trailer requester can agree own request" on public.trailer_rentals;
create policy "trailer requester can agree own request"
on public.trailer_rentals
for update
to authenticated
using (
  lower(coalesce(renter_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  lower(coalesce(renter_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- The trailer owner must be able to accept or decline requests on their own trailer.
drop policy if exists "trailer owner can update own listing" on public.trailer_rentals;
create policy "trailer owner can update own listing"
on public.trailer_rentals
for update
to authenticated
using (
  lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  lower(coalesce(owner_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
