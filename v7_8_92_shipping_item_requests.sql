-- Habesha Connect V7.8.92 Shipping Sender-First Item Requests
-- Run this in Supabase SQL Editor before testing Post Item to Ship.

create extension if not exists pgcrypto;

create table if not exists public.hc_shipping_items (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  tracking_number text,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text,
  sender_email text,
  sender_phone text,
  traveler_id uuid references public.profiles(id) on delete set null,
  traveler_name text,
  traveler_email text,
  traveler_phone text,
  from_city text,
  to_city text,
  needed_by date,
  item_description text,
  weight_lb numeric default 0,
  receiver_name text,
  receiver_phone text,
  notes text,
  status text default 'Pending Admin Approval',
  paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hc_shipping_items_status_idx on public.hc_shipping_items(status);
create index if not exists hc_shipping_items_sender_email_idx on public.hc_shipping_items(lower(sender_email));
create index if not exists hc_shipping_items_traveler_email_idx on public.hc_shipping_items(lower(traveler_email));
create index if not exists hc_shipping_items_route_idx on public.hc_shipping_items(from_city, to_city);

alter table public.hc_shipping_items enable row level security;

drop policy if exists "hc_shipping_items_select" on public.hc_shipping_items;
create policy "hc_shipping_items_select" on public.hc_shipping_items
for select using (true);

drop policy if exists "hc_shipping_items_insert" on public.hc_shipping_items;
create policy "hc_shipping_items_insert" on public.hc_shipping_items
for insert with check (auth.uid() is not null);

drop policy if exists "hc_shipping_items_update" on public.hc_shipping_items;
create policy "hc_shipping_items_update" on public.hc_shipping_items
for update using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "hc_shipping_items_delete" on public.hc_shipping_items;
create policy "hc_shipping_items_delete" on public.hc_shipping_items
for delete using (auth.uid() is not null);
