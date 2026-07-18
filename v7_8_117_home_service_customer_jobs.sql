-- V7.8.117 Customer-posted Home Service jobs
create table if not exists public.home_service_customer_jobs (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  category text not null default '',
  title text not null default '',
  city text not null default '',
  preferred_date date,
  preferred_time text not null default '',
  budget text not null default '',
  details text not null default '',
  status text not null default 'Pending Admin Approval',
  provider_name text not null default '',
  provider_email text not null default '',
  provider_phone text not null default '',
  admin_approved_at timestamptz,
  provider_accepted_at timestamptz,
  provider_completed_at timestamptz,
  customer_confirmed_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_service_customer_jobs enable row level security;

drop policy if exists "home service customer jobs read" on public.home_service_customer_jobs;
create policy "home service customer jobs read"
on public.home_service_customer_jobs for select
to anon, authenticated
using (true);

drop policy if exists "home service customer jobs insert" on public.home_service_customer_jobs;
create policy "home service customer jobs insert"
on public.home_service_customer_jobs for insert
to anon, authenticated
with check (true);

drop policy if exists "home service customer jobs update" on public.home_service_customer_jobs;
create policy "home service customer jobs update"
on public.home_service_customer_jobs for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "home service customer jobs delete" on public.home_service_customer_jobs;
create policy "home service customer jobs delete"
on public.home_service_customer_jobs for delete
to anon, authenticated
using (true);

create index if not exists home_service_customer_jobs_status_idx
  on public.home_service_customer_jobs(status);
create index if not exists home_service_customer_jobs_category_idx
  on public.home_service_customer_jobs(category);
create index if not exists home_service_customer_jobs_customer_email_idx
  on public.home_service_customer_jobs(lower(customer_email));
create index if not exists home_service_customer_jobs_provider_email_idx
  on public.home_service_customer_jobs(lower(provider_email));
