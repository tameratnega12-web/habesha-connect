-- Habesha Agenagn V7.8.281
-- Marketplace photo attachment repair. Run once after V7.8.280.

alter table if exists public.marketplace_listings
  add column if not exists photo_urls text[] not null default '{}'::text[];

-- Allow a signed-in seller to update only their own Marketplace listing.
drop policy if exists "v78281 marketplace seller update own listing" on public.marketplace_listings;
create policy "v78281 marketplace seller update own listing"
on public.marketplace_listings
for update
to authenticated
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

-- Secure fallback used by the app when an older policy still blocks the direct update.
create or replace function public.marketplace_set_listing_photos(
  p_listing_id uuid,
  p_photo_urls text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.marketplace_listings
     set photo_urls = coalesce(p_photo_urls, '{}'::text[])
   where id = p_listing_id
     and seller_id = auth.uid();

  if not found then
    raise exception 'Marketplace listing not found or you are not the seller.';
  end if;
end;
$$;

revoke all on function public.marketplace_set_listing_photos(uuid,text[]) from public;
grant execute on function public.marketplace_set_listing_photos(uuid,text[]) to authenticated;
