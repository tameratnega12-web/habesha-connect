-- V7.8.316 RENTALS clean owner decision rebuild
-- Rental-only migration. Replaces prior Rental Accept/Decline RPC behavior.
-- Matches properties.owner_id to either profiles.id or auth.users.id.

create or replace function public.rental_owner_decide_request_v78316(
  p_request_id text,
  p_decision text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_profile_id text;
  v_request public.rental_requests;
  v_property public.properties;
  v_decision text := lower(trim(coalesce(p_decision,'')));
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select p.id::text
    into v_profile_id
  from public.profiles p
  where p.auth_user_id = v_uid
     or lower(coalesce(p.email,'')) = v_email
  order by case when p.auth_user_id = v_uid then 0 else 1 end
  limit 1;

  select *
    into v_request
  from public.rental_requests
  where id::text = p_request_id
  for update;

  if not found then
    raise exception 'Rental request not found';
  end if;

  select *
    into v_property
  from public.properties
  where id = v_request.property_id
  for update;

  if not found then
    raise exception 'Rental property not found';
  end if;

  if not (
    v_property.owner_id::text = v_uid::text
    or (v_profile_id is not null and v_property.owner_id::text = v_profile_id)
    or exists (
      select 1 from public.profiles owner_profile
      where owner_profile.id::text = v_property.owner_id::text
        and (owner_profile.auth_user_id = v_uid or lower(coalesce(owner_profile.email,'')) = v_email)
    )
  ) then
    raise exception 'Only the property owner can decide this request';
  end if;

  if coalesce(v_request.status,'') not in ('Pending Owner Review','Pending','Waiting Owner Review') then
    raise exception 'Request status is %, not waiting for owner review', coalesce(v_request.status,'');
  end if;

  if v_decision = 'accept' then
    update public.rental_requests
       set status = 'Approved', paid = true
     where id = v_request.id;

    update public.properties
       set status = 'Rented'
     where id = v_property.id;

    update public.rental_requests
       set status = 'Declined'
     where property_id = v_property.id
       and id <> v_request.id
       and coalesce(status,'') in ('Pending Owner Review','Pending','Waiting Owner Review');

  elsif v_decision = 'decline' then
    update public.rental_requests
       set status = 'Declined'
     where id = v_request.id;

    if coalesce(v_property.status,'') <> 'Rented' then
      update public.properties
         set status = 'Approved'
       where id = v_property.id;
    end if;
  else
    raise exception 'Decision must be accept or decline';
  end if;

  return jsonb_build_object(
    'ok', true,
    'request_id', v_request.id,
    'property_id', v_property.id,
    'decision', v_decision,
    'request_status', case when v_decision='accept' then 'Approved' else 'Declined' end,
    'property_status', case when v_decision='accept' then 'Rented' else coalesce(v_property.status,'Approved') end
  );
end;
$$;

revoke all on function public.rental_owner_decide_request_v78316(text,text) from public;
grant execute on function public.rental_owner_decide_request_v78316(text,text) to authenticated;

-- Ensure signed-in owners can read requests for their own properties.
alter table public.rental_requests enable row level security;

drop policy if exists rental_requests_owner_read_v78316 on public.rental_requests;
create policy rental_requests_owner_read_v78316
on public.rental_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.properties pr
    left join public.profiles op on op.id::text = pr.owner_id::text
    where pr.id = rental_requests.property_id
      and (
        pr.owner_id::text = auth.uid()::text
        or op.auth_user_id = auth.uid()
        or lower(coalesce(op.email,'')) = lower(coalesce(auth.jwt() ->> 'email',''))
      )
  )
);

-- Seeker can continue reading their own request.
drop policy if exists rental_requests_seeker_read_v78316 on public.rental_requests;
create policy rental_requests_seeker_read_v78316
on public.rental_requests
for select
to authenticated
using (
  seeker_id::text = auth.uid()::text
  or exists (
    select 1 from public.profiles sp
    where sp.id::text = rental_requests.seeker_id::text
      and (sp.auth_user_id = auth.uid() or lower(coalesce(sp.email,'')) = lower(coalesce(auth.jwt() ->> 'email','')))
  )
);
