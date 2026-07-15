-- Habesha Agenagn V7.8.307
-- RENTALS ONLY: reliable Property Owner Accept / Decline actions.
-- Matches the V7.8.305 client tables: public.properties and public.rental_requests.
-- Does not alter any unrelated category tables or workflows.

begin;

create or replace function public.hc_rental_owner_accept_v78307(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.rental_requests%rowtype;
  v_prop public.properties%rowtype;
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_is_owner boolean := false;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into v_req
  from public.rental_requests
  where id = p_request_id
  for update;
  if not found then raise exception 'Rental request not found.'; end if;

  select * into v_prop
  from public.properties
  where id = v_req.property_id
  for update;
  if not found then raise exception 'Rental property not found.'; end if;

  v_is_owner :=
       v_prop.owner_id = auth.uid()
    or lower(coalesce(v_prop.owner_email,'')) = v_email
    or exists (
      select 1 from public.profiles p
      where p.id = v_prop.owner_id
        and (p.auth_user_id = auth.uid() or p.id = auth.uid())
    );

  if not v_is_owner then raise exception 'Only the property owner can accept this request.'; end if;
  if coalesce(v_req.status,'') not in ('Pending Owner Review','Pending','Waiting Owner Review') then
    raise exception 'This request is not waiting for owner review.';
  end if;

  update public.rental_requests
     set status = 'Approved', paid = true, updated_at = now()
   where id = p_request_id;

  update public.properties
     set status = 'Rented', updated_at = now()
   where id = v_req.property_id;

  update public.rental_requests
     set status = 'Closed', updated_at = now()
   where property_id = v_req.property_id
     and id <> p_request_id
     and coalesce(status,'') not in ('Declined','Cancelled','Closed');

  return jsonb_build_object('ok',true,'request_id',p_request_id,'property_id',v_req.property_id,'status','Approved');
end;
$$;

create or replace function public.hc_rental_owner_decline_v78307(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.rental_requests%rowtype;
  v_prop public.properties%rowtype;
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_is_owner boolean := false;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select * into v_req
  from public.rental_requests
  where id = p_request_id
  for update;
  if not found then raise exception 'Rental request not found.'; end if;

  select * into v_prop
  from public.properties
  where id = v_req.property_id
  for update;
  if not found then raise exception 'Rental property not found.'; end if;

  v_is_owner :=
       v_prop.owner_id = auth.uid()
    or lower(coalesce(v_prop.owner_email,'')) = v_email
    or exists (
      select 1 from public.profiles p
      where p.id = v_prop.owner_id
        and (p.auth_user_id = auth.uid() or p.id = auth.uid())
    );

  if not v_is_owner then raise exception 'Only the property owner can decline this request.'; end if;
  if coalesce(v_req.status,'') not in ('Pending Owner Review','Pending','Waiting Owner Review') then
    raise exception 'This request is not waiting for owner review.';
  end if;

  update public.rental_requests
     set status = 'Declined', updated_at = now()
   where id = p_request_id;

  update public.properties
     set status = case when status = 'Rented' then status else 'Approved' end,
         updated_at = now()
   where id = v_req.property_id;

  return jsonb_build_object('ok',true,'request_id',p_request_id,'property_id',v_req.property_id,'status','Declined');
end;
$$;

grant execute on function public.hc_rental_owner_accept_v78307(uuid) to authenticated;
grant execute on function public.hc_rental_owner_decline_v78307(uuid) to authenticated;

commit;
notify pgrst, 'reload schema';

select routine_name
from information_schema.routines
where routine_schema='public'
  and routine_name in ('hc_rental_owner_accept_v78307','hc_rental_owner_decline_v78307')
order by routine_name;
