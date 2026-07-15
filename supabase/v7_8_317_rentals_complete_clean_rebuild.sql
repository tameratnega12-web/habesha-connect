-- V7.8.317 RENTALS COMPLETE CLEAN REBUILD
-- Rental-only migration. Replaces all earlier rental request/decision functions.
-- Canonical flow:
-- Property owner posts -> Admin approves property -> Seeker requests -> Owner accepts/declines
-- -> Accepted seeker clicks Request Owner Information.

alter table public.rental_requests
  add column if not exists owner_contact_released boolean not null default false;

alter table public.rental_requests enable row level security;

-- Remove earlier Rental RPCs so the frontend has one authoritative flow.
drop function if exists public.rental_owner_decide_request_v78316(text,text);
drop function if exists public.rental_owner_decide_request_v78315(text,text);
drop function if exists public.rental_owner_decide_request_v78313(text,text);
drop function if exists public.rental_create_request_v78317(text);
drop function if exists public.rental_owner_decide_v78317(text,boolean);
drop function if exists public.rental_release_owner_contact_v78317(text);

-- Resolve the signed-in user's profile and create one pending request.
create function public.rental_create_request_v78317(p_property_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_profile public.profiles;
  v_property public.properties;
  v_request public.rental_requests;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_profile
  from public.profiles p
  where p.auth_user_id = v_uid or lower(coalesce(p.email,'')) = v_email
  order by case when p.auth_user_id = v_uid then 0 else 1 end
  limit 1;
  if not found then raise exception 'Signed-in profile not found'; end if;

  select * into v_property
  from public.properties p
  where p.id::text = p_property_id
  limit 1;
  if not found then raise exception 'Rental property not found'; end if;

  if coalesce(v_property.status,'') not in ('Approved','Available') then
    raise exception 'This property is not available';
  end if;

  if v_property.owner_id::text = v_profile.id::text
     or v_property.owner_id::text = v_uid::text then
    raise exception 'You cannot request your own property';
  end if;

  select * into v_request
  from public.rental_requests rr
  where rr.property_id::text = v_property.id::text
    and rr.seeker_id::text = v_profile.id::text
    and coalesce(rr.status,'') in ('Pending','Approved')
  order by rr.created_at desc nulls last
  limit 1;

  if found then
    return jsonb_build_object('ok',true,'request_id',v_request.id,'status',v_request.status,'already_exists',true);
  end if;

  insert into public.rental_requests(property_id,seeker_id,paid,status,owner_contact_released)
  values(v_property.id,v_profile.id,true,'Pending',false)
  returning * into v_request;

  return jsonb_build_object('ok',true,'request_id',v_request.id,'status','Pending','already_exists',false);
end;
$$;

-- Owner accepts or declines. Ownership is checked against profiles.id, auth_user_id, and email.
create function public.rental_owner_decide_v78317(p_request_id text,p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_owner_profile public.profiles;
  v_request public.rental_requests;
  v_property public.properties;
  v_new_status text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_owner_profile
  from public.profiles p
  where p.auth_user_id = v_uid or lower(coalesce(p.email,'')) = v_email
  order by case when p.auth_user_id = v_uid then 0 else 1 end
  limit 1;
  if not found then raise exception 'Signed-in owner profile not found'; end if;

  select * into v_request
  from public.rental_requests rr
  where rr.id::text = p_request_id
  for update;
  if not found then raise exception 'Rental request not found'; end if;

  select * into v_property
  from public.properties p
  where p.id::text = v_request.property_id::text
  for update;
  if not found then raise exception 'Rental property not found'; end if;

  if not (
    v_property.owner_id::text = v_owner_profile.id::text
    or v_property.owner_id::text = v_uid::text
    or exists (
      select 1 from public.profiles op
      where op.id::text = v_property.owner_id::text
        and (op.auth_user_id = v_uid or lower(coalesce(op.email,'')) = v_email)
    )
  ) then
    raise exception 'Only the property owner can respond';
  end if;

  if coalesce(v_request.status,'') <> 'Pending' then
    raise exception 'This request is not pending';
  end if;

  v_new_status := case when p_accept then 'Approved' else 'Declined' end;
  update public.rental_requests
    set status=v_new_status, owner_contact_released=false
    where id=v_request.id;

  if p_accept then
    update public.properties set status='Rented' where id=v_property.id;
    update public.rental_requests
      set status='Declined', owner_contact_released=false
      where property_id=v_property.id and id<>v_request.id and coalesce(status,'')='Pending';
  else
    update public.properties
      set status='Approved'
      where id=v_property.id and coalesce(status,'')<>'Rented';
  end if;

  return jsonb_build_object('ok',true,'request_id',v_request.id,'property_id',v_property.id,'status',v_new_status);
end;
$$;

-- Accepted seeker explicitly releases the owner's contact information.
create function public.rental_release_owner_contact_v78317(p_request_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_seeker_profile public.profiles;
  v_request public.rental_requests;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_seeker_profile
  from public.profiles p
  where p.auth_user_id = v_uid or lower(coalesce(p.email,'')) = v_email
  order by case when p.auth_user_id = v_uid then 0 else 1 end
  limit 1;
  if not found then raise exception 'Signed-in seeker profile not found'; end if;

  select * into v_request
  from public.rental_requests rr
  where rr.id::text = p_request_id
  for update;
  if not found then raise exception 'Rental request not found'; end if;

  if v_request.seeker_id::text <> v_seeker_profile.id::text
     and v_request.seeker_id::text <> v_uid::text then
    raise exception 'Only the approved seeker can release owner information';
  end if;
  if coalesce(v_request.status,'') <> 'Approved' then
    raise exception 'The owner has not accepted this request';
  end if;

  update public.rental_requests set owner_contact_released=true where id=v_request.id;
  return jsonb_build_object('ok',true,'request_id',v_request.id,'owner_contact_released',true);
end;
$$;

revoke all on function public.rental_create_request_v78317(text) from public;
revoke all on function public.rental_owner_decide_v78317(text,boolean) from public;
revoke all on function public.rental_release_owner_contact_v78317(text) from public;
grant execute on function public.rental_create_request_v78317(text) to authenticated;
grant execute on function public.rental_owner_decide_v78317(text,boolean) to authenticated;
grant execute on function public.rental_release_owner_contact_v78317(text) to authenticated;

-- Replace only Rental request read policies with one clear owner/seeker/admin policy.
drop policy if exists rental_requests_owner_read_v78316 on public.rental_requests;
drop policy if exists rental_requests_seeker_read_v78316 on public.rental_requests;
drop policy if exists rental_requests_read_v78317 on public.rental_requests;
create policy rental_requests_read_v78317
on public.rental_requests for select to authenticated
using (
  exists (
    select 1 from public.profiles me
    where (me.auth_user_id=auth.uid() or lower(coalesce(me.email,''))=lower(coalesce(auth.jwt()->>'email','')))
      and (
        me.id::text=rental_requests.seeker_id::text
        or exists (
          select 1 from public.properties pr
          where pr.id::text=rental_requests.property_id::text
            and (pr.owner_id::text=me.id::text or pr.owner_id::text=auth.uid()::text)
        )
        or coalesce(me.role,'')='admin'
      )
  )
);
