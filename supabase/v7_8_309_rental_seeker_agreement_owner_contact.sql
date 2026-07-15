-- Habesha Agenagn V7.8.309 - RENTALS ONLY
-- Owner accepts -> seeker agrees -> owner contact is released.
-- Does not alter any non-rental table or workflow.

begin;

-- Keep the rental status constraint compatible with the existing flow and the two new states.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid='public.rental_requests'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.rental_requests drop constraint if exists %I',c.conname);
  end loop;
end $$;

alter table public.rental_requests
  add constraint rental_requests_status_check_v78309
  check (status in (
    'Pending','Pending Admin Review','Pending Owner Review','Waiting Owner Review',
    'Owner Accepted - Waiting Final Admin Approval','Owner Accepted - Waiting Seeker Agreement',
    'Approved','Rented','Approved - Owner Information Released',
    'Seeker Agreed - Owner Information Released',
    'Declined','Owner Declined','Cancelled','Closed'
  ));

create or replace function public.rental_seeker_agree_and_release_owner(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_uid uuid:=auth.uid();
  v_email text:=lower(coalesce(auth.jwt()->>'email',''));
  v_request public.rental_requests%rowtype;
  v_authorized boolean:=false;
begin
  if v_uid is null then raise exception 'You must be signed in.'; end if;

  select * into v_request
  from public.rental_requests
  where id=p_request_id
  for update;

  if not found then raise exception 'Rental request not found.'; end if;

  select exists(
    select 1
    from public.profiles p
    where p.id=v_request.seeker_id
      and (
        p.id=v_uid
        or p.auth_user_id=v_uid
        or lower(coalesce(p.email,''))=v_email
      )
  ) into v_authorized;

  if not v_authorized then raise exception 'Only the accepted rent seeker can agree.'; end if;

  if v_request.status='Seeker Agreed - Owner Information Released' then
    return jsonb_build_object('ok',true,'status',v_request.status);
  end if;

  if v_request.status<>'Owner Accepted - Waiting Seeker Agreement' then
    raise exception 'This request is not waiting for seeker agreement.';
  end if;

  update public.rental_requests
  set status='Seeker Agreed - Owner Information Released'
  where id=p_request_id;

  return jsonb_build_object('ok',true,'status','Seeker Agreed - Owner Information Released');
end;
$$;

revoke all on function public.rental_seeker_agree_and_release_owner(uuid) from public;
grant execute on function public.rental_seeker_agree_and_release_owner(uuid) to authenticated;

commit;
