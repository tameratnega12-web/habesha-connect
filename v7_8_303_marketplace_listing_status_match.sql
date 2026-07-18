-- Habesha Agenagn V7.8.303
-- Marketplace listing status constraint/function alignment.
-- Run once in Supabase SQL Editor. Safe to run again.

begin;

alter table if exists public.marketplace_listings
  drop constraint if exists marketplace_listings_status_check;

alter table if exists public.marketplace_listings
  add constraint marketplace_listings_status_check
  check (status in (
    'Pending Admin Approval',
    'Approved',
    'Available',
    'Declined',
    'Sold Waiting Admin Verification',
    'Sold Verified',
    'Completed',
    'Closed'
  ));

alter table if exists public.marketplace_listings
  alter column status set default 'Pending Admin Approval';

create or replace function public.marketplace_create_listing_v78302(
  p_seller_name text,
  p_seller_phone text,
  p_title text,
  p_description text,
  p_category text,
  p_price numeric,
  p_item_condition text,
  p_city text
)
returns public.marketplace_listings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.marketplace_listings;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to post a Marketplace item.';
  end if;

  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if v_email = '' then
    raise exception 'Your signed-in account does not have an email address.';
  end if;

  if nullif(trim(coalesce(p_title, '')), '') is null then
    raise exception 'Item title is required.';
  end if;
  if coalesce(p_price, 0) <= 0 then
    raise exception 'Price must be greater than zero.';
  end if;
  if nullif(trim(coalesce(p_city, '')), '') is null then
    raise exception 'City is required.';
  end if;

  insert into public.marketplace_listings (
    seller_id,
    seller_name,
    seller_email,
    seller_phone,
    title,
    description,
    category,
    price,
    item_condition,
    city,
    photo_urls,
    status
  ) values (
    auth.uid(),
    nullif(trim(coalesce(p_seller_name, '')), ''),
    v_email,
    nullif(trim(coalesce(p_seller_phone, '')), ''),
    trim(p_title),
    coalesce(p_description, ''),
    coalesce(nullif(trim(p_category), ''), 'Other'),
    p_price,
    coalesce(nullif(trim(p_item_condition), ''), 'Good'),
    trim(p_city),
    '{}'::text[],
    'Pending Admin Approval'
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.marketplace_create_listing_v78302(text,text,text,text,text,numeric,text,text) from public;
grant execute on function public.marketplace_create_listing_v78302(text,text,text,text,text,numeric,text,text) to authenticated;

commit;
