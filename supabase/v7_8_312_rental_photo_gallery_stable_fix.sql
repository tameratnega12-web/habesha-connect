-- V7.8.311 Rental photo Storage RLS fix
-- Folder format: <auth.uid>/<property_id>/<filename>
-- This policy verifies the signed-in user directly and avoids the earlier
-- property-folder lookup that was blocking valid uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rental-property-media',
  'rental-property-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Remove only the previous Rental photo policies.
drop policy if exists "rental owners upload property photos" on storage.objects;
drop policy if exists "public reads rental property photos" on storage.objects;
drop policy if exists "rental owners update property photos" on storage.objects;
drop policy if exists "rental owners delete property photos" on storage.objects;

create policy "rental owners upload property photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'rental-property-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "public reads rental property photos"
on storage.objects for select to public
using (bucket_id = 'rental-property-media');

create policy "rental owners update property photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'rental-property-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'rental-property-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "rental owners delete property photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'rental-property-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Keep the secure URL attachment function aligned with the signed-in owner.
alter table public.properties
  add column if not exists photos jsonb not null default '[]'::jsonb;

drop function if exists public.rental_attach_photos_v78307(uuid, jsonb);
drop function if exists public.rental_attach_photos_v78307(text, jsonb);

create function public.rental_attach_photos_v78307(
  p_property_id text,
  p_photos jsonb
)
returns public.properties
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.properties;
begin
  update public.properties
  set photos = coalesce(p_photos, '[]'::jsonb)
  where id::text = p_property_id
    and owner_id::text = auth.uid()::text
  returning * into v_row;

  if v_row is null then
    raise exception 'Property not found or not owned by current user';
  end if;

  return v_row;
end;
$$;

revoke all on function public.rental_attach_photos_v78307(text, jsonb) from public;
grant execute on function public.rental_attach_photos_v78307(text, jsonb) to authenticated;
