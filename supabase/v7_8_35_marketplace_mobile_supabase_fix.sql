-- V7.8.35 Marketplace Mobile/Supabase Fix
-- Run this once in Supabase SQL Editor. Choose "Run and enable RLS" if prompted.

create extension if not exists pgcrypto;

create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete set null,
  seller_name text,
  seller_email text,
  seller_phone text,
  title text not null,
  description text,
  category text,
  price numeric(10,2) not null default 0,
  item_condition text,
  city text,
  photo_urls text[] default '{}',
  status text default 'pending_admin',
  admin_note text,
  created_at timestamptz default now()
);

alter table marketplace_listings add column if not exists seller_email text;
alter table marketplace_listings add column if not exists seller_phone text;
alter table marketplace_listings add column if not exists photo_urls text[] default '{}';
alter table marketplace_listings add column if not exists item_condition text;
alter table marketplace_listings add column if not exists admin_note text;

create table if not exists marketplace_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references marketplace_listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  seller_name text,
  seller_email text,
  seller_phone text,
  item_title text,
  message text,
  status text default 'pending_admin',
  admin_note text,
  seller_note text,
  created_at timestamptz default now()
);

alter table marketplace_purchase_requests add column if not exists buyer_email text;
alter table marketplace_purchase_requests add column if not exists seller_name text;
alter table marketplace_purchase_requests add column if not exists seller_email text;
alter table marketplace_purchase_requests add column if not exists seller_phone text;
alter table marketplace_purchase_requests add column if not exists item_title text;
alter table marketplace_purchase_requests add column if not exists buyer_phone text;
alter table marketplace_purchase_requests add column if not exists admin_note text;
alter table marketplace_purchase_requests add column if not exists seller_note text;

alter table marketplace_listings enable row level security;
alter table marketplace_purchase_requests enable row level security;

-- Replace older restrictive beta policies with policies that let the app work on desktop and phone.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='marketplace_listings' loop
    execute format('drop policy if exists %I on marketplace_listings', p.policyname);
  end loop;
  for p in select policyname from pg_policies where schemaname='public' and tablename='marketplace_purchase_requests' loop
    execute format('drop policy if exists %I on marketplace_purchase_requests', p.policyname);
  end loop;
end $$;

create policy "marketplace listings select authenticated"
on marketplace_listings for select to authenticated using (true);

create policy "marketplace listings insert own"
on marketplace_listings for insert to authenticated
with check (seller_id = auth.uid() or seller_id is null);

create policy "marketplace listings update authenticated beta"
on marketplace_listings for update to authenticated using (true) with check (true);

create policy "marketplace requests select authenticated"
on marketplace_purchase_requests for select to authenticated using (true);

create policy "marketplace requests insert own"
on marketplace_purchase_requests for insert to authenticated
with check (buyer_id = auth.uid() or buyer_id is null);

create policy "marketplace requests update authenticated beta"
on marketplace_purchase_requests for update to authenticated using (true) with check (true);

create index if not exists marketplace_listings_status_idx on marketplace_listings(status);
create index if not exists marketplace_listings_city_idx on marketplace_listings(city);
create index if not exists marketplace_listings_category_idx on marketplace_listings(category);
create index if not exists marketplace_purchase_requests_status_idx on marketplace_purchase_requests(status);
create index if not exists marketplace_purchase_requests_listing_id_idx on marketplace_purchase_requests(listing_id);
