-- Habesha Agenagn V7.8.300
-- Run once in Supabase SQL Editor.
-- Clean, single Home Services customer completion function.

create or replace function public.hc_complete_home_service_v300(p_ref text, p_kind text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_kind text := lower(trim(coalesce(p_kind,'')));
  v_local_ref text;
  v_deleted integer := 0;
begin
  if v_email = '' then raise exception 'Sign in is required'; end if;

  if v_kind = 'job' then
    select local_ref into v_local_ref
    from public.home_service_customer_jobs
    where lower(coalesce(customer_email,''))=v_email
      and (id::text=p_ref or coalesce(local_ref,'')=p_ref)
      and status='Work Completed - Customer Confirmation'
    order by created_at desc limit 1 for update;
    if not found then return jsonb_build_object('cleared',true,'already_missing',true,'deleted',0); end if;
    delete from public.home_service_customer_jobs
    where lower(coalesce(customer_email,''))=v_email
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
      and (id::text=p_ref or coalesce(local_ref,'')=coalesce(v_local_ref,''));
    get diagnostics v_deleted=row_count;
  elsif v_kind = 'direct' then
    select local_ref into v_local_ref
    from public.home_service_requests
    where lower(coalesce(customer_email,''))=v_email
      and (id::text=p_ref or coalesce(local_ref,'')=p_ref)
      and status='Work Completed - Customer Confirmation'
    order by created_at desc limit 1 for update;
    if not found then return jsonb_build_object('cleared',true,'already_missing',true,'deleted',0); end if;
    delete from public.home_service_requests
    where lower(coalesce(customer_email,''))=v_email
      and status in ('Work Completed - Customer Confirmation','Completed','Closed')
      and (id::text=p_ref or coalesce(local_ref,'')=coalesce(v_local_ref,''));
    get diagnostics v_deleted=row_count;
  else
    raise exception 'Unknown Home Services transaction type';
  end if;
  return jsonb_build_object('cleared',true,'deleted',v_deleted);
end;
$$;

grant execute on function public.hc_complete_home_service_v300(text,text) to authenticated;
