-- Habesha Agenagn V7.6.1 Trucking Trailer Rent
-- Adds one new Supabase table used only by the Trucking module.
-- Existing Shipping, Rentals, Marketplace, Business, Admin, Auth, and previous Trucking tables are not changed.

create table if not exists public.trailer_rentals (
  id uuid primary key default uuid_generate_v4(),
  local_ref text unique,
  owner_name text,
  owner_email text,
  owner_phone text,
  trailer_type text not null,
  location text,
  price text,
  deposit text,
  availability text,
  description text,
  status text default 'Available',
  renter_name text,
  renter_email text,
  renter_phone text,
  rented_at timestamptz,
  created_at timestamptz default now()
);

alter table public.trailer_rentals enable row level security;

do $$ begin
  create policy "temporary all trailer_rentals" on public.trailer_rentals for all using (true) with check (true);
exception when duplicate_object then null; end $$;
