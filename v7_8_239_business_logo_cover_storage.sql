-- Habesha Agenagn V7.8.239
-- Business logo and cover photo storage.
-- Safe to run more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-media',
  'business-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public business profiles need to display approved logos and cover images.
drop policy if exists "Public can view business media" on storage.objects;
create policy "Public can view business media"
on storage.objects for select
using (bucket_id = 'business-media');

-- A signed-in business owner may upload only inside the folder for a business
-- whose business_records row belongs to that owner's email.
drop policy if exists "Business owners upload own business media" on storage.objects;
create policy "Business owners upload own business media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.business_records br
    where br.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(br.owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
      and br.record_type = 'business_profile'
  )
);

drop policy if exists "Business owners update own business media" on storage.objects;
create policy "Business owners update own business media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.business_records br
    where br.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(br.owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
      and br.record_type = 'business_profile'
  )
)
with check (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.business_records br
    where br.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(br.owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
      and br.record_type = 'business_profile'
  )
);

drop policy if exists "Business owners delete own business media" on storage.objects;
create policy "Business owners delete own business media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-media'
  and exists (
    select 1
    from public.business_records br
    where br.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(br.owner_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
      and br.record_type = 'business_profile'
  )
);
