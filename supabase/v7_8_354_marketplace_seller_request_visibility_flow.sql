-- Habesha Agenagn V7.8.354
-- Marketplace request visibility and party-action alignment.
-- Scope: marketplace_purchase_requests only.
-- Run once in Supabase SQL Editor.

begin;

alter table if exists public.marketplace_purchase_requests enable row level security;

grant select, insert, update on public.marketplace_purchase_requests to authenticated;
grant select on public.marketplace_listings to authenticated;

-- Helper used only by the Marketplace policies below.
create or replace function public.hc_v78354_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where (p.id = auth.uid() or lower(coalesce(p.email,'')) = lower(coalesce(auth.jwt()->>'email','')))
      and (
        lower(coalesce(p.role,'')) = 'admin'
        or lower(coalesce(p.active_role,'')) = 'admin'
        or 'admin' = any(coalesce(p.roles, array[]::text[]))
      )
  );
$$;

grant execute on function public.hc_v78354_is_admin() to authenticated;

-- Replace prior overlapping Marketplace request policies with one consistent party-based set.
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname='public' and tablename='marketplace_purchase_requests'
  loop
    execute format('drop policy if exists %I on public.marketplace_purchase_requests',pol.policyname);
  end loop;
end $$;

create policy "v78354 marketplace parties read requests"
on public.marketplace_purchase_requests
for select
to authenticated
using (
  buyer_id = auth.uid()
  or exists (
    select 1 from public.marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
      and ml.seller_id = auth.uid()
  )
  or public.hc_v78354_is_admin()
);

create policy "v78354 buyer creates own request"
on public.marketplace_purchase_requests
for insert
to authenticated
with check (buyer_id = auth.uid());

create policy "v78354 marketplace parties update request"
on public.marketplace_purchase_requests
for update
to authenticated
using (
  buyer_id = auth.uid()
  or exists (
    select 1 from public.marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
      and ml.seller_id = auth.uid()
  )
  or public.hc_v78354_is_admin()
)
with check (
  buyer_id = auth.uid()
  or exists (
    select 1 from public.marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
      and ml.seller_id = auth.uid()
  )
  or public.hc_v78354_is_admin()
);

-- Ensure the request statuses used by the current front end are accepted.
alter table public.marketplace_purchase_requests
  drop constraint if exists marketplace_purchase_requests_status_check;

alter table public.marketplace_purchase_requests
  add constraint marketplace_purchase_requests_status_check
  check (status in (
    'pending_admin',
    'admin_approved',
    'admin_declined',
    'seller_accepted_waiting_admin',
    'seller_declined',
    'connection_admin_approved',
    'connection_admin_declined',
    'completed',
    'cancelled'
  ));

commit;
