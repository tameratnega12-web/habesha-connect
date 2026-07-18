-- Habesha Agenagn V7.8.280
-- Marketplace photo storage. Run once in Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-media',
  'marketplace-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "v78280 marketplace photos public read" on storage.objects;
create policy "v78280 marketplace photos public read"
on storage.objects for select
to public
using (bucket_id = 'marketplace-media');

drop policy if exists "v78280 marketplace sellers upload own photos" on storage.objects;
create policy "v78280 marketplace sellers upload own photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'marketplace-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "v78280 marketplace sellers update own photos" on storage.objects;
create policy "v78280 marketplace sellers update own photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'marketplace-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'marketplace-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "v78280 marketplace sellers delete own photos" on storage.objects;
create policy "v78280 marketplace sellers delete own photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'marketplace-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
