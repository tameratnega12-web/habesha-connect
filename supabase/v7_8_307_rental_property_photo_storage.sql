-- V7.8.307 Rental property photo storage and secure attachment
-- Compatible with properties.id / owner_id stored as UUID or text.

alter table public.properties
  add column if not exists photos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('rental-property-media', 'rental-property-media', true)
on conflict (id) do update set public = true;

alter table public.properties enable row level security;

-- A signed-in property owner may upload only inside the folder for a property they own.
drop policy if exists "rental owners upload property photos" on storage.objects;
create policy "rental owners upload property photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'rental-property-media'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_id::text = auth.uid()::text
  )
);

-- Public bucket images must be readable wherever an approved property is shown.
drop policy if exists "public reads rental property photos" on storage.objects;
create policy "public reads rental property photos"
on storage.objects for select to public
using (bucket_id = 'rental-property-media');

-- Owners may replace/update files in their own property folder.
drop policy if exists "rental owners update property photos" on storage.objects;
create policy "rental owners update property photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'rental-property-media'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_id::text = auth.uid()::text
  )
)
with check (
  bucket_id = 'rental-property-media'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_id::text = auth.uid()::text
  )
);

-- Owners may delete only photos belonging to their own property.
drop policy if exists "rental owners delete property photos" on storage.objects;
create policy "rental owners delete property photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'rental-property-media'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[1]
      and p.owner_id::text = auth.uid()::text
  )
);

-- Remove the earlier UUID-only overload if it was already installed.
drop function if exists public.rental_attach_photos_v78307(uuid, jsonb);
drop function if exists public.rental_attach_photos_v78307(text, jsonb);

-- Attach URLs only to a property owned by the signed-in user.
-- Text comparison keeps this compatible with UUID or text primary/owner keys.
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
