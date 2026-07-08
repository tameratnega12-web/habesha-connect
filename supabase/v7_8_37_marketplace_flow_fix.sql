-- V7.8.37 Marketplace flow fix
-- Run this once in Supabase SQL Editor. It is safe to run again.

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

alter table marketplace_listings add column if not exists seller_email text;
alter table marketplace_purchase_requests add column if not exists buyer_email text;
alter table marketplace_purchase_requests add column if not exists seller_name text;
alter table marketplace_purchase_requests add column if not exists seller_email text;
alter table marketplace_purchase_requests add column if not exists seller_phone text;
alter table marketplace_purchase_requests add column if not exists item_title text;

alter table marketplace_listings enable row level security;
alter table marketplace_purchase_requests enable row level security;

-- Remove older policies that may block admin dashboard reads/updates.
drop policy if exists "Sellers can create marketplace listings" on marketplace_listings;
drop policy if exists "Sellers can view their own marketplace listings" on marketplace_listings;
drop policy if exists "Everyone can view approved marketplace listings" on marketplace_listings;
drop policy if exists "Sellers can update their own marketplace listings" on marketplace_listings;
drop policy if exists "Buyers can create marketplace purchase requests" on marketplace_purchase_requests;
drop policy if exists "Buyers can view their own marketplace requests" on marketplace_purchase_requests;
drop policy if exists "Sellers can view requests for their listings" on marketplace_purchase_requests;
drop policy if exists "Sellers can update requests for their listings" on marketplace_purchase_requests;
drop policy if exists "Marketplace listings insert own" on marketplace_listings;
drop policy if exists "Marketplace listings select visible" on marketplace_listings;
drop policy if exists "Marketplace listings update owner admin" on marketplace_listings;
drop policy if exists "Marketplace requests insert own" on marketplace_purchase_requests;
drop policy if exists "Marketplace requests select related" on marketplace_purchase_requests;
drop policy if exists "Marketplace requests update related" on marketplace_purchase_requests;

create policy "Marketplace listings insert own"
on marketplace_listings for insert to authenticated
with check (seller_id = auth.uid() or seller_email = auth.jwt()->>'email');

create policy "Marketplace listings select visible"
on marketplace_listings for select to authenticated
using (
  status in ('admin_approved','sold_waiting_admin','sold_admin_approved')
  or seller_id = auth.uid()
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
);

create policy "Marketplace listings update owner admin"
on marketplace_listings for update to authenticated
using (
  seller_id = auth.uid()
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
)
with check (
  seller_id = auth.uid()
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
);

create policy "Marketplace requests insert own"
on marketplace_purchase_requests for insert to authenticated
with check (buyer_id = auth.uid() or buyer_email = auth.jwt()->>'email');

create policy "Marketplace requests select related"
on marketplace_purchase_requests for select to authenticated
using (
  buyer_id = auth.uid()
  or buyer_email = auth.jwt()->>'email'
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
);

create policy "Marketplace requests update related"
on marketplace_purchase_requests for update to authenticated
using (
  buyer_id = auth.uid()
  or buyer_email = auth.jwt()->>'email'
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
)
with check (
  buyer_id = auth.uid()
  or buyer_email = auth.jwt()->>'email'
  or seller_email = auth.jwt()->>'email'
  or exists (select 1 from profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(p.roles)))
);

create index if not exists marketplace_listings_status_idx on marketplace_listings(status);
create index if not exists marketplace_listings_seller_email_idx on marketplace_listings(seller_email);
create index if not exists marketplace_purchase_requests_status_idx on marketplace_purchase_requests(status);
create index if not exists marketplace_purchase_requests_listing_id_idx on marketplace_purchase_requests(listing_id);
create index if not exists marketplace_purchase_requests_buyer_email_idx on marketplace_purchase_requests(buyer_email);
create index if not exists marketplace_purchase_requests_seller_email_idx on marketplace_purchase_requests(seller_email);
