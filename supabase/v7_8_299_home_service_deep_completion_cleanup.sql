-- Habesha Agenagn V7.8.299
-- Run once in Supabase SQL Editor.
-- Final Home Services customer-completion cleanup.
-- Accepts either a Supabase UUID or the browser local_ref and deletes every
-- duplicate completed row for the same customer transaction atomically.

create or replace function public.hc_complete_home_service_transaction(
  p_ref text,
  p_kind text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_kind text := lower(trim(coalesce(p_kind,'')));
  v_local_ref text;
  v_title text;
  v_provider_email text;
  v_provider_name text;
  v_count integer := 0;
begin
  if v_email = '' then
    raise exception 'Sign in is required';
  end if;

  if v_kind = 'job' then
    select local_ref, title, provider_email, provider_name
      into v_local_ref, v_title, v_provider_email, v_provider_name
    from public.home_service_customer_jobs
    where lower(coalesce(customer_email,'')) = v_email
      and (id::text = p_ref or coalesce(local_ref,'') = p_ref)
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
    order by created_at desc
    limit 1
    for update;

    if not found then
      return jsonb_build_object('cleared',true,'already_missing',true,'deleted',0);
    end if;

    delete from public.home_service_customer_jobs
    where lower(coalesce(customer_email,'')) = v_email
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
      and (
        id::text = p_ref
        or (v_local_ref is not null and v_local_ref <> '' and local_ref = v_local_ref)
        or (
          lower(trim(coalesce(title,''))) = lower(trim(coalesce(v_title,'')))
          and lower(trim(coalesce(provider_email,''))) = lower(trim(coalesce(v_provider_email,'')))
        )
      );
    get diagnostics v_count = row_count;

  elsif v_kind = 'direct' then
    select local_ref, service_title, provider_email, provider_name
      into v_local_ref, v_title, v_provider_email, v_provider_name
    from public.home_service_requests
    where lower(coalesce(customer_email,'')) = v_email
      and (id::text = p_ref or coalesce(local_ref,'') = p_ref)
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
    order by created_at desc
    limit 1
    for update;

    if not found then
      return jsonb_build_object('cleared',true,'already_missing',true,'deleted',0);
    end if;

    delete from public.home_service_requests
    where lower(coalesce(customer_email,'')) = v_email
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
      and (
        id::text = p_ref
        or (v_local_ref is not null and v_local_ref <> '' and local_ref = v_local_ref)
        or (
          lower(trim(coalesce(service_title,''))) = lower(trim(coalesce(v_title,'')))
          and lower(trim(coalesce(provider_email,''))) = lower(trim(coalesce(v_provider_email,'')))
        )
      );
    get diagnostics v_count = row_count;
  else
    raise exception 'Unknown Home Services transaction type';
  end if;

  return jsonb_build_object(
    'cleared', true,
    'deleted', v_count,
    'provider_email', v_provider_email,
    'provider_name', v_provider_name,
    'title', v_title
  );
end;
$$;

grant execute on function public.hc_complete_home_service_transaction(text,text) to authenticated;
