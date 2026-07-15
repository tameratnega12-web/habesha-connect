-- V7.8.307 Rental property photo storage and secure attachment
alter table public.properties add column if not exists photos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('rental-property-media','rental-property-media',true)
on conflict (id) do update set public=true;

alter table public.properties enable row level security;

drop policy if exists "rental owners upload property photos" on storage.objects;
create policy "rental owners upload property photos"
on storage.objects for insert to authenticated
with check (
  bucket_id='rental-property-media'
  and exists (
    select 1 from public.properties p
    where p.id::text=(storage.foldername(name))[1]
      and p.owner_id=auth.uid()
  )
);

drop policy if exists "public reads rental property photos" on storage.objects;
create policy "public reads rental property photos"
on storage.objects for select to public
using (bucket_id='rental-property-media');

drop policy if exists "rental owners delete property photos" on storage.objects;
create policy "rental owners delete property photos"
on storage.objects for delete to authenticated
using (
  bucket_id='rental-property-media'
  and exists (
    select 1 from public.properties p
    where p.id::text=(storage.foldername(name))[1]
      and p.owner_id=auth.uid()
  )
);

create or replace function public.rental_attach_photos_v78307(p_property_id uuid, p_photos jsonb)
returns public.properties
language plpgsql
security definer
set search_path=public
as $$
declare v_row public.properties;
begin
  update public.properties
  set photos=coalesce(p_photos,'[]'::jsonb)
  where id=p_property_id and owner_id=auth.uid()
  returning * into v_row;
  if v_row.id is null then raise exception 'Property not found or not owned by current user'; end if;
  return v_row;
end;
$$;
revoke all on function public.rental_attach_photos_v78307(uuid,jsonb) from public;
grant execute on function public.rental_attach_photos_v78307(uuid,jsonb) to authenticated;
