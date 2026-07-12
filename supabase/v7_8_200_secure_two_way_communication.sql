-- V7.8.200: secure the shared two-way communication table.
-- Run after v7_8_199_two_way_communication.sql.

alter table public.community_matches enable row level security;

drop policy if exists "community matches read" on public.community_matches;
drop policy if exists "community matches insert" on public.community_matches;
drop policy if exists "community matches update" on public.community_matches;
drop policy if exists "community matches delete" on public.community_matches;
drop policy if exists "community matches authenticated read" on public.community_matches;
drop policy if exists "community matches participant insert" on public.community_matches;
drop policy if exists "community matches participant update" on public.community_matches;
drop policy if exists "community matches participant delete" on public.community_matches;

-- Signed-in users can see approved public opportunities and records in which they participate.
create policy "community matches authenticated read"
on public.community_matches
for select
to authenticated
using (
  status in ('Approved','Available','Open','Pending Response','Offer Accepted','Initiator Agreed','Completed')
  or lower(coalesce(poster_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(initiator_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(auth.jwt()->>'email','')) = 'admin.habeshaconnect@gmail.com'
);

-- A signed-in user may create only a record that identifies that user as poster or initiator.
create policy "community matches participant insert"
on public.community_matches
for insert
to authenticated
with check (
  lower(coalesce(poster_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(initiator_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(auth.jwt()->>'email','')) = 'admin.habeshaconnect@gmail.com'
);

-- Only a participant or Admin may update a record.
create policy "community matches participant update"
on public.community_matches
for update
to authenticated
using (
  lower(coalesce(poster_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(initiator_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(auth.jwt()->>'email','')) = 'admin.habeshaconnect@gmail.com'
)
with check (
  lower(coalesce(poster_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(initiator_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(auth.jwt()->>'email','')) = 'admin.habeshaconnect@gmail.com'
);

-- Only the original poster or Admin may delete a record.
create policy "community matches participant delete"
on public.community_matches
for delete
to authenticated
using (
  lower(coalesce(poster_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
  or lower(coalesce(auth.jwt()->>'email','')) = 'admin.habeshaconnect@gmail.com'
);
