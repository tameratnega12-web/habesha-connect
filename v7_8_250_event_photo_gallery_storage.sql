-- Habesha Agenagn V7.8.250
-- Event Organizer photo gallery storage.
-- Run once in Supabase SQL Editor. Safe to run again.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-media',
  'event-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view event media" on storage.objects;
create policy "Public can view event media"
on storage.objects for select
using (bucket_id = 'event-media');

drop policy if exists "Event organizers upload own event media" on storage.objects;
create policy "Event organizers upload own event media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'event-media'
  and exists (
    select 1 from public.community_events ce
    where ce.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(ce.organizer_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists "Event organizers update own event media" on storage.objects;
create policy "Event organizers update own event media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'event-media'
  and exists (
    select 1 from public.community_events ce
    where ce.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(ce.organizer_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  )
)
with check (
  bucket_id = 'event-media'
  and exists (
    select 1 from public.community_events ce
    where ce.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(ce.organizer_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists "Event organizers delete own event media" on storage.objects;
create policy "Event organizers delete own event media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'event-media'
  and exists (
    select 1 from public.community_events ce
    where ce.id::text = split_part(storage.objects.name, '/', 1)
      and lower(coalesce(ce.organizer_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);
