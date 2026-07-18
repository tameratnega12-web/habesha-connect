-- Habesha Agenagn V7.8.298
-- Run once in Supabase SQL Editor.
-- Gives the authenticated customer one atomic way to confirm and remove a
-- completed Home Services transaction. Other users cannot call it for that row.

create or replace function public.hc_complete_home_service_customer_job(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.home_service_customer_jobs%rowtype;
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  select * into v_row from public.home_service_customer_jobs where id=p_id for update;
  if not found then return jsonb_build_object('cleared',true,'already_missing',true); end if;
  if v_email='' or lower(coalesce(v_row.customer_email,''))<>v_email then raise exception 'Only the customer can confirm completion'; end if;
  if v_row.status not in ('Work Completed - Customer Confirmation','Completed') then raise exception 'Transaction is not waiting for customer confirmation'; end if;
  delete from public.home_service_customer_jobs where id=p_id;
  return jsonb_build_object('cleared',true,'provider_email',v_row.provider_email,'provider_name',v_row.provider_name,'title',v_row.title);
end;
$$;

grant execute on function public.hc_complete_home_service_customer_job(uuid) to authenticated;

create or replace function public.hc_complete_home_service_request(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.home_service_requests%rowtype;
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  select * into v_row from public.home_service_requests where id=p_id for update;
  if not found then return jsonb_build_object('cleared',true,'already_missing',true); end if;
  if v_email='' or lower(coalesce(v_row.customer_email,''))<>v_email then raise exception 'Only the customer can confirm completion'; end if;
  if v_row.status not in ('Work Completed - Customer Confirmation','Completed') then raise exception 'Transaction is not waiting for customer confirmation'; end if;
  delete from public.home_service_requests where id=p_id;
  return jsonb_build_object('cleared',true,'provider_email',v_row.provider_email,'provider_name',v_row.provider_name,'title',v_row.service_title);
end;
$$;

grant execute on function public.hc_complete_home_service_request(uuid) to authenticated;
