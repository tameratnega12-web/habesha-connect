-- Habesha Agenagn V7.8.322 — RENTALS EXACT SUPABASE MATCH
-- RENTALS ONLY. This deletes old Rental test data and rebuilds the two Rental tables.

create extension if not exists pgcrypto;

-- Remove every prior Rental RPC regardless of its old argument signature.
do $$
declare r record;
begin
  for r in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) args
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'create_rental_property_v319','attach_rental_photos_v319','create_rental_request_v319',
      'decide_rental_request_v319','release_rental_contact_v319','admin_decide_rental_property_v319',
      'create_rental_property_v322','attach_rental_photos_v322','create_rental_request_v322',
      'decide_rental_request_v322','release_rental_contact_v322','admin_decide_rental_property_v322',
      'current_profile_id_v319','is_admin_v319','current_profile_id_v322','is_admin_v322'
    )
  loop
    execute format('drop function if exists %I.%I(%s) cascade',r.nspname,r.proname,r.args);
  end loop;
end $$;

-- Remove old Rental relations even if an earlier version created a view instead of a table.
do $$
declare k "char";
begin
  select relkind into k from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='rental_requests';
  if k in ('r','p') then execute 'drop table public.rental_requests cascade';
  elsif k='v' then execute 'drop view public.rental_requests cascade';
  elsif k='m' then execute 'drop materialized view public.rental_requests cascade'; end if;

  k:=null;
  select relkind into k from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='rental_properties';
  if k in ('r','p') then execute 'drop table public.rental_properties cascade';
  elsif k='v' then execute 'drop view public.rental_properties cascade';
  elsif k='m' then execute 'drop materialized view public.rental_properties cascade'; end if;
end $$;

create table public.rental_properties (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  city text not null,
  monthly_rent numeric(12,2) not null check (monthly_rent > 0),
  property_type text not null,
  address text,
  description text not null,
  photo_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected','rented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.rental_properties(id) on delete cascade,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  seeker_profile_id uuid not null references public.profiles(id) on delete cascade,
  seeker_name text,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  contact_released boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id,seeker_profile_id)
);

create index rental_properties_owner_idx on public.rental_properties(owner_profile_id);
create index rental_properties_status_idx on public.rental_properties(status);
create index rental_requests_owner_idx on public.rental_requests(owner_profile_id);
create index rental_requests_seeker_idx on public.rental_requests(seeker_profile_id);

alter table public.rental_properties enable row level security;
alter table public.rental_requests enable row level security;

create or replace function public.current_profile_id_v322() returns uuid
language sql stable security definer set search_path=public
as $$ select id from public.profiles where auth_user_id=auth.uid() limit 1 $$;

create or replace function public.is_admin_v322() returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where auth_user_id=auth.uid() and role='admin') $$;

create policy rental_properties_read_v322 on public.rental_properties for select to authenticated using (
  status='approved'
  or owner_profile_id=public.current_profile_id_v322()
  or public.is_admin_v322()
);

create policy rental_requests_read_v322 on public.rental_requests for select to authenticated using (
  owner_profile_id=public.current_profile_id_v322()
  or seeker_profile_id=public.current_profile_id_v322()
  or public.is_admin_v322()
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rental-photos','rental-photos',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

do $$
declare r record;
begin
 for r in select policyname from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'rental_photos_%'
 loop execute format('drop policy if exists %I on storage.objects',r.policyname); end loop;
end $$;

create policy rental_photos_public_read_v322 on storage.objects for select using (bucket_id='rental-photos');
create policy rental_photos_owner_insert_v322 on storage.objects for insert to authenticated with check (
  bucket_id='rental-photos'
  and (storage.foldername(name))[1]=public.current_profile_id_v322()::text
);

create or replace function public.create_rental_property_v322(
  p_title text, p_city text, p_monthly_rent numeric, p_property_type text, p_address text, p_description text
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_profile uuid:=public.current_profile_id_v322(); v_id uuid;
begin
  if v_profile is null then raise exception 'Profile not found for signed-in user'; end if;
  insert into public.rental_properties(owner_profile_id,title,city,monthly_rent,property_type,address,description)
  values(v_profile,trim(p_title),trim(p_city),p_monthly_rent,trim(p_property_type),nullif(trim(p_address),''),trim(p_description))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.attach_rental_photos_v322(p_property_id uuid,p_photo_urls text[])
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.rental_properties set photo_urls=coalesce(p_photo_urls,'{}'),updated_at=now()
  where id=p_property_id and owner_profile_id=public.current_profile_id_v322();
  if not found then raise exception 'Property not found or not owned by signed-in user'; end if;
end $$;

create or replace function public.create_rental_request_v322(p_property_id uuid,p_message text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_seeker uuid:=public.current_profile_id_v322(); v_owner uuid; v_name text; v_id uuid;
begin
  if v_seeker is null then raise exception 'Profile not found for signed-in user'; end if;
  select owner_profile_id into v_owner from public.rental_properties where id=p_property_id and status='approved';
  if v_owner is null then raise exception 'Property is not available'; end if;
  if v_owner=v_seeker then raise exception 'You cannot request your own property'; end if;
  select name into v_name from public.profiles where id=v_seeker;
  insert into public.rental_requests(property_id,owner_profile_id,seeker_profile_id,seeker_name,message)
  values(p_property_id,v_owner,v_seeker,v_name,nullif(trim(coalesce(p_message,'')),''))
  on conflict(property_id,seeker_profile_id) do update
    set message=excluded.message,status='pending',contact_released=false,updated_at=now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.decide_rental_request_v322(p_request_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public as $$
declare v_owner uuid:=public.current_profile_id_v322(); v_property uuid;
begin
  if p_decision not in ('accept','decline') then raise exception 'Invalid decision'; end if;
  select property_id into v_property from public.rental_requests
  where id=p_request_id and owner_profile_id=v_owner and status='pending' for update;
  if v_property is null then raise exception 'Pending request not found for this owner'; end if;
  if p_decision='accept' then
    update public.rental_requests set status='approved',updated_at=now() where id=p_request_id;
    update public.rental_requests set status='declined',updated_at=now()
      where property_id=v_property and id<>p_request_id and status='pending';
    update public.rental_properties set status='rented',updated_at=now()
      where id=v_property and owner_profile_id=v_owner;
  else
    update public.rental_requests set status='declined',updated_at=now() where id=p_request_id;
  end if;
end $$;

create or replace function public.release_rental_contact_v322(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_seeker uuid:=public.current_profile_id_v322(); v_owner uuid; v_result jsonb;
begin
  update public.rental_requests set contact_released=true,updated_at=now()
  where id=p_request_id and seeker_profile_id=v_seeker and status='approved'
  returning owner_profile_id into v_owner;
  if v_owner is null then raise exception 'Approved request not found'; end if;
  select jsonb_build_object('owner_name',name,'owner_phone',phone,'owner_email',email)
  into v_result from public.profiles where id=v_owner;
  return v_result;
end $$;

create or replace function public.admin_decide_rental_property_v322(p_property_id uuid,p_approve boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin_v322() then raise exception 'Admin access required'; end if;
  update public.rental_properties
  set status=case when p_approve then 'approved' else 'rejected' end,updated_at=now()
  where id=p_property_id and status='pending';
  if not found then raise exception 'Pending property not found'; end if;
end $$;

grant execute on function public.create_rental_property_v322(text,text,numeric,text,text,text) to authenticated;
grant execute on function public.attach_rental_photos_v322(uuid,text[]) to authenticated;
grant execute on function public.create_rental_request_v322(uuid,text) to authenticated;
grant execute on function public.decide_rental_request_v322(uuid,text) to authenticated;
grant execute on function public.release_rental_contact_v322(uuid) to authenticated;
grant execute on function public.admin_decide_rental_property_v322(uuid,boolean) to authenticated;

notify pgrst, 'reload schema';

-- SUCCESS CHECK: this result must show 2 tables, 18 columns, and 6 v322 Rental RPC functions.
select 'table_column' as object_type, table_name||'.'||column_name as object_name
from information_schema.columns
where table_schema='public' and table_name in ('rental_properties','rental_requests')
union all
select 'rpc_function', routine_name
from information_schema.routines
where routine_schema='public' and routine_name like '%rental%v322%'
order by 1,2;
