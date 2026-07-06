-- Marketplace Listings
create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade,
  seller_name text,
  seller_phone text,
  title text not null,
  description text,
  category text,
  price numeric(10,2) not null default 0,
  item_condition text,
  city text,
  photo_urls text[] default '{}',
  status text default 'pending_admin'
    check (status in (
      'pending_admin',
      'admin_approved',
      'admin_declined',
      'sold_waiting_admin',
      'sold_admin_approved',
      'removed'
    )),
  admin_note text,
  created_at timestamptz default now()
);

-- Marketplace Buyer Requests
create table if not exists marketplace_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references marketplace_listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete cascade,
  buyer_name text,
  buyer_phone text,
  message text,
  status text default 'pending_admin'
    check (status in (
      'pending_admin',
      'admin_approved',
      'admin_declined',
      'seller_accepted_waiting_admin',
      'seller_declined',
      'connection_admin_approved',
      'connection_admin_declined',
      'completed',
      'cancelled'
    )),
  admin_note text,
  seller_note text,
  created_at timestamptz default now()
);

-- Saved Items
create table if not exists marketplace_saved_items (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references marketplace_listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (listing_id, user_id)
);

-- Enable RLS
alter table marketplace_listings enable row level security;
alter table marketplace_purchase_requests enable row level security;
alter table marketplace_saved_items enable row level security;

-- Listings policies
create policy if not exists "Sellers can create marketplace listings"
on marketplace_listings
for insert
to authenticated
with check (auth.uid() = seller_id);

create policy if not exists "Sellers can view their own marketplace listings"
on marketplace_listings
for select
to authenticated
using (auth.uid() = seller_id);

create policy if not exists "Everyone can view approved marketplace listings"
on marketplace_listings
for select
to authenticated
using (status in ('admin_approved','sold_waiting_admin','sold_admin_approved'));

create policy if not exists "Sellers can update their own marketplace listings"
on marketplace_listings
for update
to authenticated
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

-- Purchase request policies
create policy if not exists "Buyers can create marketplace purchase requests"
on marketplace_purchase_requests
for insert
to authenticated
with check (auth.uid() = buyer_id);

create policy if not exists "Buyers can view their own marketplace requests"
on marketplace_purchase_requests
for select
to authenticated
using (auth.uid() = buyer_id);

create policy if not exists "Sellers can view requests for their listings"
on marketplace_purchase_requests
for select
to authenticated
using (
  exists (
    select 1
    from marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
    and ml.seller_id = auth.uid()
  )
);

create policy if not exists "Sellers can update requests for their listings"
on marketplace_purchase_requests
for update
to authenticated
using (
  exists (
    select 1
    from marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
    and ml.seller_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from marketplace_listings ml
    where ml.id = marketplace_purchase_requests.listing_id
    and ml.seller_id = auth.uid()
  )
);

-- Saved items policies
create policy if not exists "Users can save marketplace items"
on marketplace_saved_items
for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "Users can view their saved marketplace items"
on marketplace_saved_items
for select
to authenticated
using (auth.uid() = user_id);

create policy if not exists "Users can remove their saved marketplace items"
on marketplace_saved_items
for delete
to authenticated
using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists marketplace_listings_status_idx
on marketplace_listings(status);

create index if not exists marketplace_listings_category_idx
on marketplace_listings(category);

create index if not exists marketplace_listings_city_idx
on marketplace_listings(city);

create index if not exists marketplace_purchase_requests_status_idx
on marketplace_purchase_requests(status);

create index if not exists marketplace_purchase_requests_listing_id_idx
on marketplace_purchase_requests(listing_id);
