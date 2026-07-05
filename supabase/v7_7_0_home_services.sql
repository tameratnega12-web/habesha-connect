-- Habesha Agenagn V7.7.0 Home Services
-- Adds new Supabase tables used only by the Home Services module.
-- Existing Shipping, Rentals, Marketplace, Business, Admin, Auth, Trucking, and Trailer tables are not changed.

create table if not exists public.home_service_providers (
  id uuid primary key default uuid_generate_v4(),
  local_ref text unique,
  provider_name text,
  provider_email text not null,
  provider_phone text,
  business_name text not null,
  category text not null,
  service_area text not null,
  experience text,
  price_note text,
  description text,
  license_info text,
  status text not null default 'Pending Admin Approval',
  rating numeric,
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.home_service_requests (
  id uuid primary key default uuid_generate_v4(),
  local_ref text unique,
  provider_id uuid references public.home_service_providers(id) on delete set null,
  provider_local_ref text,
  provider_name text,
  provider_email text not null,
  customer_name text,
  customer_email text not null,
  customer_phone text,
  category text,
  service_address text,
  preferred_date text,
  job_description text not null,
  quote_amount text,
  status text not null default 'Requested',
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_home_service_providers_email on public.home_service_providers(provider_email);
create index if not exists idx_home_service_providers_status on public.home_service_providers(status);
create index if not exists idx_home_service_requests_provider_email on public.home_service_requests(provider_email);
create index if not exists idx_home_service_requests_customer_email on public.home_service_requests(customer_email);

alter table public.home_service_providers enable row level security;
alter table public.home_service_requests enable row level security;

drop policy if exists "home service providers read" on public.home_service_providers;
create policy "home service providers read" on public.home_service_providers for select using (true);

drop policy if exists "home service providers insert" on public.home_service_providers;
create policy "home service providers insert" on public.home_service_providers for insert with check (true);

drop policy if exists "home service providers update" on public.home_service_providers;
create policy "home service providers update" on public.home_service_providers for update using (true) with check (true);

drop policy if exists "home service requests read" on public.home_service_requests;
create policy "home service requests read" on public.home_service_requests for select using (true);

drop policy if exists "home service requests insert" on public.home_service_requests;
create policy "home service requests insert" on public.home_service_requests for insert with check (true);

drop policy if exists "home service requests update" on public.home_service_requests;
create policy "home service requests update" on public.home_service_requests for update using (true) with check (true);
