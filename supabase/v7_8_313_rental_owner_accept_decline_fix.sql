-- V7.8.313 Rental owner Accept / Decline fix
-- Rental-only change. The signed-in property owner can decide a request even
-- when the client-side joined request does not contain a copied owner email.

create or replace function public.rental_owner_decide_request_v78313(
  p_request_id text,
  p_decision text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.rental_requests;
  v_property public.properties;
  v_decision text := lower(trim(coalesce(p_decision,'')));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_request
  from public.rental_requests
  where id::text = p_request_id
  for update;

  if v_request is null then
    raise exception 'Rental request not found';
  end if;

  select * into v_property
  from public.properties
  where id = v_request.property_id
  for update;

  if v_property is null then
    raise exception 'Rental property not found';
  end if;

  if v_property.owner_id::text <> auth.uid()::text then
    raise exception 'Only the property owner can decide this request';
  end if;

  if coalesce(v_request.status,'') not in ('Pending Owner Review','Pending','Waiting Owner Review') then
    raise exception 'This request is not waiting for owner review';
  end if;

  if v_decision = 'accept' then
    update public.rental_requests
       set status = 'Approved', paid = true
     where id = v_request.id;

    update public.properties
       set status = 'Rented'
     where id = v_property.id;

    update public.rental_requests
       set status = 'Closed'
     where property_id = v_property.id
       and id <> v_request.id
       and coalesce(status,'') not in ('Declined','Cancelled','Closed');

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
    'request_id', v_request.id,
    'property_id', v_property.id,
    'decision', v_decision,
    'request_status', case when v_decision='accept' then 'Approved' else 'Declined' end,
    'property_status', case when v_decision='accept' then 'Rented' else 'Approved' end
  );
end;
$$;

revoke all on function public.rental_owner_decide_request_v78313(text,text) from public;
grant execute on function public.rental_owner_decide_request_v78313(text,text) to authenticated;
