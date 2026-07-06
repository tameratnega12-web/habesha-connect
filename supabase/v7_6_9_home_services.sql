-- V7.6.9 Home Services workflow
-- Provider posts service -> Admin approves -> Customer requests -> Admin approves -> Provider accepts/declines
create table if not exists public.home_service_posts (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  provider_name text,
  provider_email text,
  provider_phone text,
  category text,
  title text not null,
  city text,
  price text,
  description text,
  status text default 'Pending Admin Approval',
  created_at timestamptz default now(),
  approved_at timestamptz,
  declined_at timestamptz
);

create table if not exists public.home_service_requests (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  service_id uuid references public.home_service_posts(id) on delete set null,
  service_local_ref text,
  service_title text,
  provider_name text,
  provider_email text,
  customer_name text,
  customer_email text,
  customer_phone text,
  city text,
  preferred_date text,
  details text,
  status text default 'Pending Admin Approval',
  created_at timestamptz default now(),
  admin_approved_at timestamptz,
  provider_responded_at timestamptz
);

alter table public.home_service_posts enable row level security;
alter table public.home_service_requests enable row level security;

drop policy if exists "home_service_posts_authenticated_all" on public.home_service_posts;
create policy "home_service_posts_authenticated_all" on public.home_service_posts
for all to authenticated using (true) with check (true);

drop policy if exists "home_service_requests_authenticated_all" on public.home_service_requests;
create policy "home_service_requests_authenticated_all" on public.home_service_requests
for all to authenticated using (true) with check (true);

-- Safe updates for existing projects that already ran an older Home Services SQL.
alter table if exists public.home_service_posts add column if not exists city text;
alter table if exists public.home_service_posts add column if not exists price text;
alter table if exists public.home_service_posts add column if not exists description text;
alter table if exists public.home_service_posts add column if not exists provider_phone text;
alter table if exists public.home_service_requests add column if not exists customer_phone text;
alter table if exists public.home_service_requests add column if not exists city text;
alter table if exists public.home_service_requests add column if not exists preferred_date text;
alter table if exists public.home_service_requests add column if not exists details text;
alter table if exists public.home_service_requests add column if not exists admin_approved_at timestamptz;
alter table if exists public.home_service_requests add column if not exists provider_responded_at timestamptz;
