-- Habesha Connect V4.0 Supabase schema
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('admin','owner','rent_seeker','sender','traveler','customer','driver','business_owner')),
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  city text,
  property_type text,
  bedrooms int,
  bathrooms int,
  monthly_rent numeric,
  security_deposit numeric,
  move_in_date date,
  lease_term text,
  pets_allowed text,
  parking text,
  furnished boolean default false,
  utilities_included text,
  photos text[] default '{}',
  owner_paid boolean default false,
  status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists public.rental_requests (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade,
  seeker_id uuid references public.profiles(id) on delete cascade,
  paid boolean default false,
  status text default 'Requested',
  created_at timestamptz default now(),
  unique(property_id, seeker_id)
);

create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  traveler_id uuid references public.profiles(id) on delete cascade,
  from_city text not null,
  to_city text not null,
  travel_date date,
  original_space_lb numeric not null default 0,
  remaining_space_lb numeric not null default 0,
  status text default 'Open',
  created_at timestamptz default now()
);

create table if not exists public.shipments (
  id uuid primary key default uuid_generate_v4(),
  tracking_number text unique,
  sender_id uuid references public.profiles(id) on delete cascade,
  traveler_id uuid references public.profiles(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  from_city text,
  to_city text,
  weight_lb numeric not null default 0,
  package_photo text,
  receiver_name text,
  receiver_phone text,
  paid boolean default false,
  status text default 'Waiting for Traveler',
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  service text not null,
  description text,
  amount numeric not null default 0,
  status text default 'Paid',
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  service text,
  created_at timestamptz default now()
);

create table if not exists public.app_settings (
  id int primary key default 1,
  owner_listing_fee numeric default 25,
  seeker_viewing_fee numeric default 10,
  shipping_rate_per_lb numeric default 9,
  traveler_commission_per_lb numeric default 2,
  app_commission_per_lb numeric default 2,
  registration_open boolean default true,
  maintenance_mode boolean default false,
  updated_at timestamptz default now(),
  constraint one_settings_row check (id = 1)
);

insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

-- For first testing only: open policies. We will tighten these after login works.
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rental_requests enable row level security;
alter table public.trips enable row level security;
alter table public.shipments enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.app_settings enable row level security;

do $$ begin
  create policy "temporary read profiles" on public.profiles for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary write profiles" on public.profiles for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all properties" on public.properties for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all rental_requests" on public.rental_requests for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all trips" on public.trips for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all shipments" on public.shipments for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all payments" on public.payments for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all messages" on public.messages for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all notifications" on public.notifications for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all reviews" on public.reviews for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "temporary all app_settings" on public.app_settings for all using (true) with check (true);
exception when duplicate_object then null; end $$;
