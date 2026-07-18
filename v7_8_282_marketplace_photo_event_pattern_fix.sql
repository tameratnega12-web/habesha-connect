-- Habesha Agenagn V7.8.282
-- Marketplace photos using the same proven listing-ID folder pattern as Event Organizer.
-- Run once in Supabase SQL Editor. Safe to run again.

alter table if exists public.marketplace_listings
  add column if not exists photo_urls text[] not null default '{}'::text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-media',
  'marketplace-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public listing photos must be readable after admin approval and by dashboard users.
drop policy if exists "v78282 public reads marketplace photos" on storage.objects;
create policy "v78282 public reads marketplace photos"
on storage.objects for select
to public
using (bucket_id = 'marketplace-media');

-- The first Storage folder is the Marketplace listing UUID, exactly like Event Organizer.
drop policy if exists "v78282 seller uploads listing photos" on storage.objects;
create policy "v78282 seller uploads listing photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'marketplace-media'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id::text = split_part(storage.objects.name, '/', 1)
      and (
        ml.seller_id = auth.uid()
        or lower(coalesce(ml.seller_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
      )
  )
);

drop policy if exists "v78282 seller updates listing photos" on storage.objects;
create policy "v78282 seller updates listing photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'marketplace-media'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id::text = split_part(storage.objects.name, '/', 1)
      and (ml.seller_id = auth.uid() or lower(coalesce(ml.seller_email,'')) = lower(coalesce(auth.jwt()->>'email','')))
  )
)
with check (
  bucket_id = 'marketplace-media'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id::text = split_part(storage.objects.name, '/', 1)
      and (ml.seller_id = auth.uid() or lower(coalesce(ml.seller_email,'')) = lower(coalesce(auth.jwt()->>'email','')))
  )
);

drop policy if exists "v78282 seller deletes listing photos" on storage.objects;
create policy "v78282 seller deletes listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'marketplace-media'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id::text = split_part(storage.objects.name, '/', 1)
      and (ml.seller_id = auth.uid() or lower(coalesce(ml.seller_email,'')) = lower(coalesce(auth.jwt()->>'email','')))
  )
);

-- Ensure the seller can attach URLs to their own listing.
drop policy if exists "v78282 seller updates own marketplace listing" on public.marketplace_listings;
create policy "v78282 seller updates own marketplace listing"
on public.marketplace_listings for update
to authenticated
using (
  seller_id = auth.uid()
  or lower(coalesce(seller_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
)
with check (
  seller_id = auth.uid()
  or lower(coalesce(seller_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
);

create or replace function public.marketplace_attach_photos_v78282(
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
     and (
       seller_id = auth.uid()
       or lower(coalesce(seller_email,'')) = lower(coalesce(auth.jwt()->>'email',''))
     );
  if not found then
    raise exception 'Marketplace listing not found or this account is not the seller.';
  end if;
end;
$$;

revoke all on function public.marketplace_attach_photos_v78282(uuid,text[]) from public;
grant execute on function public.marketplace_attach_photos_v78282(uuid,text[]) to authenticated;
