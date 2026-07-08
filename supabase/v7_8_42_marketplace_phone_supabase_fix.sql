-- Habesha Connect V7.8.42 Marketplace Phone + Supabase Fix
-- Run this once in Supabase SQL Editor if Marketplace post/approve/request gives a Supabase error.
-- It does not delete old data.

create extension if not exists pgcrypto;

create table if not exists public.marketplace_listings (
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.marketplace_listings
  add column if not exists seller_id uuid references auth.users(id) on delete set null,
  add column if not exists seller_name text,
  add column if not exists seller_email text,
  add column if not exists seller_phone text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists price numeric(10,2) default 0,
  add column if not exists item_condition text,
  add column if not exists city text,
  add column if not exists photo_urls text[] default '{}',
  add column if not exists status text default 'pending_admin',
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz default now();

alter table public.marketplace_listings drop constraint if exists marketplace_listings_status_check;
alter table public.marketplace_listings add constraint marketplace_listings_status_check check (status in ('pending_admin','admin_approved','admin_declined','sold_waiting_admin','sold_admin_approved','removed'));

create table if not exists public.marketplace_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  message text,
  status text default 'pending_admin',
  admin_note text,
  seller_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.marketplace_purchase_requests
  add column if not exists listing_id uuid references public.marketplace_listings(id) on delete cascade,
  add column if not exists buyer_id uuid references auth.users(id) on delete set null,
  add column if not exists buyer_name text,
  add column if not exists buyer_email text,
  add column if not exists buyer_phone text,
  add column if not exists message text,
  add column if not exists status text default 'pending_admin',
  add column if not exists admin_note text,
  add column if not exists seller_note text,
  add column if not exists updated_at timestamptz default now();

alter table public.marketplace_purchase_requests drop constraint if exists marketplace_purchase_requests_status_check;
alter table public.marketplace_purchase_requests add constraint marketplace_purchase_requests_status_check check (status in ('pending_admin','admin_approved','admin_declined','seller_accepted_waiting_admin','seller_declined','connection_admin_approved','connection_admin_declined','completed','cancelled'));

create table if not exists public.marketplace_saved_items (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (listing_id, user_id)
);

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_purchase_requests enable row level security;
alter table public.marketplace_saved_items enable row level security;

-- Replace old Marketplace policies with complete phone/admin policies.
drop policy if exists "Sellers can create marketplace listings" on public.marketplace_listings;
drop policy if exists "Sellers can view their own marketplace listings" on public.marketplace_listings;
drop policy if exists "Everyone can view approved marketplace listings" on public.marketplace_listings;
drop policy if exists "Sellers can update their own marketplace listings" on public.marketplace_listings;
drop policy if exists "Admins can manage marketplace listings" on public.marketplace_listings;

create policy "Sellers can create marketplace listings" on public.marketplace_listings for insert to authenticated with check (auth.uid() = seller_id);
create policy "Sellers can view their own marketplace listings" on public.marketplace_listings for select to authenticated using (auth.uid() = seller_id);
create policy "Everyone can view approved marketplace listings" on public.marketplace_listings for select to authenticated using (status in ('admin_approved','sold_waiting_admin','sold_admin_approved'));
create policy "Sellers can update their own marketplace listings" on public.marketplace_listings for update to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "Admins can manage marketplace listings" on public.marketplace_listings for all to authenticated using (exists (select 1 from public.profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(coalesce(p.roles,array[]::text[]))))) with check (exists (select 1 from public.profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(coalesce(p.roles,array[]::text[])))));

drop policy if exists "Buyers can create marketplace purchase requests" on public.marketplace_purchase_requests;
drop policy if exists "Buyers can view their own marketplace requests" on public.marketplace_purchase_requests;
drop policy if exists "Sellers can view requests for their listings" on public.marketplace_purchase_requests;
drop policy if exists "Sellers can update requests for their listings" on public.marketplace_purchase_requests;
drop policy if exists "Admins can manage marketplace purchase requests" on public.marketplace_purchase_requests;

create policy "Buyers can create marketplace purchase requests" on public.marketplace_purchase_requests for insert to authenticated with check (auth.uid() = buyer_id);
create policy "Buyers can view their own marketplace requests" on public.marketplace_purchase_requests for select to authenticated using (auth.uid() = buyer_id);
create policy "Sellers can view requests for their listings" on public.marketplace_purchase_requests for select to authenticated using (exists (select 1 from public.marketplace_listings ml where ml.id = marketplace_purchase_requests.listing_id and ml.seller_id = auth.uid()));
create policy "Sellers can update requests for their listings" on public.marketplace_purchase_requests for update to authenticated using (exists (select 1 from public.marketplace_listings ml where ml.id = marketplace_purchase_requests.listing_id and ml.seller_id = auth.uid())) with check (exists (select 1 from public.marketplace_listings ml where ml.id = marketplace_purchase_requests.listing_id and ml.seller_id = auth.uid()));
create policy "Admins can manage marketplace purchase requests" on public.marketplace_purchase_requests for all to authenticated using (exists (select 1 from public.profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(coalesce(p.roles,array[]::text[]))))) with check (exists (select 1 from public.profiles p where p.auth_user_id = auth.uid() and (p.role='admin' or p.active_role='admin' or 'admin' = any(coalesce(p.roles,array[]::text[])))));

drop policy if exists "Users can save marketplace items" on public.marketplace_saved_items;
drop policy if exists "Users can view their saved items" on public.marketplace_saved_items;
drop policy if exists "Users can view their saved marketplace items" on public.marketplace_saved_items;
drop policy if exists "Users can remove their saved marketplace items" on public.marketplace_saved_items;

create policy "Users can save marketplace items" on public.marketplace_saved_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view their saved marketplace items" on public.marketplace_saved_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can remove their saved marketplace items" on public.marketplace_saved_items for delete to authenticated using (auth.uid() = user_id);

create index if not exists marketplace_listings_status_idx on public.marketplace_listings(status);
create index if not exists marketplace_listings_seller_email_idx on public.marketplace_listings(seller_email);
create index if not exists marketplace_purchase_requests_status_idx on public.marketplace_purchase_requests(status);
create index if not exists marketplace_purchase_requests_listing_id_idx on public.marketplace_purchase_requests(listing_id);
create index if not exists marketplace_purchase_requests_buyer_email_idx on public.marketplace_purchase_requests(buyer_email);
