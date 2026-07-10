-- Habesha Agenagn V7.8.120
-- Fix Home Services records not appearing in the Admin Dashboard.
-- Run once in Supabase SQL Editor.

alter table if exists public.home_service_posts enable row level security;
alter table if exists public.home_service_requests enable row level security;

-- The app uses authenticated users and performs role checks in the UI.
-- Admin must be able to read/update all pending Home Services records.
drop policy if exists "home service posts authenticated read" on public.home_service_posts;
create policy "home service posts authenticated read"
on public.home_service_posts for select
to authenticated
using (true);

drop policy if exists "home service posts authenticated insert" on public.home_service_posts;
create policy "home service posts authenticated insert"
on public.home_service_posts for insert
to authenticated
with check (true);

drop policy if exists "home service posts authenticated update" on public.home_service_posts;
create policy "home service posts authenticated update"
on public.home_service_posts for update
to authenticated
using (true)
with check (true);

drop policy if exists "home service posts authenticated delete" on public.home_service_posts;
create policy "home service posts authenticated delete"
on public.home_service_posts for delete
to authenticated
using (true);

drop policy if exists "home service requests authenticated read" on public.home_service_requests;
create policy "home service requests authenticated read"
on public.home_service_requests for select
to authenticated
using (true);

drop policy if exists "home service requests authenticated insert" on public.home_service_requests;
create policy "home service requests authenticated insert"
on public.home_service_requests for insert
to authenticated
with check (true);

drop policy if exists "home service requests authenticated update" on public.home_service_requests;
create policy "home service requests authenticated update"
on public.home_service_requests for update
to authenticated
using (true)
with check (true);

drop policy if exists "home service requests authenticated delete" on public.home_service_requests;
create policy "home service requests authenticated delete"
on public.home_service_requests for delete
to authenticated
using (true);
