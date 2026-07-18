-- Habesha Agenagn V7.8.349
-- Run once in Supabase SQL Editor.
-- Fixes only the Home Service customer Agree / Decline / Confirm action for
-- the project's existing sign-in pattern, which may call Supabase as anon.

create or replace function public.hc_customer_home_service_action_v349(
  p_ref text,
  p_kind text,
  p_action text,
  p_customer_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_customer_email, '')));
  v_kind text := lower(trim(coalesce(p_kind, '')));
  v_action text := lower(trim(coalesce(p_action, '')));
  v_status text;
  v_local_ref text;
  v_count integer := 0;
begin
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'Customer email is required';
  end if;
  if v_kind not in ('direct', 'job') then
    raise exception 'Unknown Home Services transaction type';
  end if;
  if v_action not in ('agree', 'decline', 'confirm') then
    raise exception 'Unknown customer action';
  end if;

  if v_kind = 'direct' then
    select status, local_ref
      into v_status, v_local_ref
      from public.home_service_requests
     where lower(coalesce(customer_email, '')) = v_email
       and (id::text = p_ref or coalesce(local_ref, '') = p_ref)
     order by created_at desc
     limit 1
     for update;

    if not found then
      return jsonb_build_object('ok', true, 'already_missing', true);
    end if;

    if v_action = 'agree' then
      if v_status <> 'Provider Accepted - Waiting Customer Agreement' then
        raise exception 'This request is not waiting for customer agreement';
      end if;
      update public.home_service_requests
         set status = 'Customer Agreed', updated_at = now()
       where lower(coalesce(customer_email, '')) = v_email
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    elsif v_action = 'decline' then
      if v_status <> 'Provider Accepted - Waiting Customer Agreement' then
        raise exception 'This request is not waiting for customer response';
      end if;
      delete from public.home_service_requests
       where lower(coalesce(customer_email, '')) = v_email
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    else
      if v_status <> 'Work Completed - Customer Confirmation' then
        raise exception 'This request is not waiting for completion confirmation';
      end if;
      delete from public.home_service_requests
       where lower(coalesce(customer_email, '')) = v_email
         and status in ('Work Completed - Customer Confirmation', 'Completed', 'Closed')
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    end if;
  else
    select status, local_ref
      into v_status, v_local_ref
      from public.home_service_customer_jobs
     where lower(coalesce(customer_email, '')) = v_email
       and (id::text = p_ref or coalesce(local_ref, '') = p_ref)
     order by created_at desc
     limit 1
     for update;

    if not found then
      return jsonb_build_object('ok', true, 'already_missing', true);
    end if;

    if v_action = 'agree' then
      if v_status not in ('Provider Accepted', 'Provider Accepted - Waiting Customer Agreement') then
        raise exception 'This job is not waiting for customer agreement';
      end if;
      update public.home_service_customer_jobs
         set status = 'Customer Agreed', updated_at = now()
       where lower(coalesce(customer_email, '')) = v_email
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    elsif v_action = 'decline' then
      if v_status not in ('Provider Accepted', 'Provider Accepted - Waiting Customer Agreement') then
        raise exception 'This job is not waiting for customer response';
      end if;
      delete from public.home_service_customer_jobs
       where lower(coalesce(customer_email, '')) = v_email
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    else
      if v_status <> 'Work Completed - Customer Confirmation' then
        raise exception 'This job is not waiting for completion confirmation';
      end if;
      delete from public.home_service_customer_jobs
       where lower(coalesce(customer_email, '')) = v_email
         and status in ('Work Completed - Customer Confirmation', 'Completed', 'Closed')
         and (id::text = p_ref or coalesce(local_ref, '') = coalesce(v_local_ref, ''));
      get diagnostics v_count = row_count;
    end if;
  end if;

  return jsonb_build_object('ok', true, 'action', v_action, 'affected', v_count);
end;
$$;

revoke all on function public.hc_customer_home_service_action_v349(text,text,text,text) from public;
grant execute on function public.hc_customer_home_service_action_v349(text,text,text,text) to anon, authenticated;
