-- Habesha Agenagn V7.8.287
-- Shipping sender + traveler consent records before contact information release.
-- Run once in Supabase SQL Editor.

alter table if exists public.shipments
  add column if not exists sender_consent boolean not null default false,
  add column if not exists sender_consent_at timestamptz,
  add column if not exists sender_consent_version text,
  add column if not exists traveler_consent boolean not null default false,
  add column if not exists traveler_consent_at timestamptz,
  add column if not exists traveler_consent_version text;

alter table if exists public.hc_shipping_items
  add column if not exists sender_consent boolean not null default false,
  add column if not exists sender_consent_at timestamptz,
  add column if not exists sender_consent_version text,
  add column if not exists traveler_consent boolean not null default false,
  add column if not exists traveler_consent_at timestamptz,
  add column if not exists traveler_consent_version text;

create or replace function public.record_shipping_consent(
  p_record_id uuid,
  p_party text,
  p_version text default 'shipping-v1-2026-07-14'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_uid uuid := auth.uid();
  v_ok boolean := false;
begin
  if v_uid is null then raise exception 'Sign in is required'; end if;
  if p_party not in ('sender','traveler') then raise exception 'Invalid consent party'; end if;

  select exists(
    select 1 from public.shipments s
    left join public.profiles sp on sp.id=s.sender_id
    left join public.profiles tp on tp.id=s.traveler_id
    where s.id=p_record_id and (
      (p_party='sender' and (sp.auth_user_id=v_uid or lower(coalesce(sp.email,''))=v_email or lower(coalesce(s.sender_name,''))=v_email))
      or
      (p_party='traveler' and (tp.auth_user_id=v_uid or lower(coalesce(tp.email,''))=v_email))
    )
  ) into v_ok;
  if not v_ok then raise exception 'You are not authorized to sign this shipping agreement'; end if;

  if p_party='sender' then
    update public.shipments set sender_consent=true,sender_consent_at=now(),sender_consent_version=p_version where id=p_record_id;
  else
    update public.shipments set traveler_consent=true,traveler_consent_at=now(),traveler_consent_version=p_version where id=p_record_id;
  end if;
  return jsonb_build_object('ok',true,'party',p_party,'record_id',p_record_id);
end;
$$;

create or replace function public.record_shipping_item_consent(
  p_record_id uuid,
  p_party text,
  p_version text default 'shipping-v1-2026-07-14'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_uid uuid := auth.uid();
  v_ok boolean := false;
begin
  if v_uid is null then raise exception 'Sign in is required'; end if;
  if p_party not in ('sender','traveler') then raise exception 'Invalid consent party'; end if;

  select exists(
    select 1 from public.hc_shipping_items s
    left join public.profiles sp on sp.id=s.sender_id
    left join public.profiles tp on tp.id=s.traveler_id
    where s.id=p_record_id and (
      (p_party='sender' and (sp.auth_user_id=v_uid or lower(coalesce(sp.email,''))=v_email or lower(coalesce(s.sender_email,''))=v_email))
      or
      (p_party='traveler' and (tp.auth_user_id=v_uid or lower(coalesce(tp.email,''))=v_email or lower(coalesce(s.traveler_email,''))=v_email))
    )
  ) into v_ok;
  if not v_ok then raise exception 'You are not authorized to sign this shipping agreement'; end if;

  if p_party='sender' then
    update public.hc_shipping_items set sender_consent=true,sender_consent_at=now(),sender_consent_version=p_version,updated_at=now() where id=p_record_id;
  else
    update public.hc_shipping_items set traveler_consent=true,traveler_consent_at=now(),traveler_consent_version=p_version,updated_at=now() where id=p_record_id;
  end if;
  return jsonb_build_object('ok',true,'party',p_party,'record_id',p_record_id);
end;
$$;

revoke all on function public.record_shipping_consent(uuid,text,text) from public;
grant execute on function public.record_shipping_consent(uuid,text,text) to authenticated;
revoke all on function public.record_shipping_item_consent(uuid,text,text) from public;
grant execute on function public.record_shipping_item_consent(uuid,text,text) to authenticated;
