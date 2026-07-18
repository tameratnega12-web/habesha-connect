-- V7.8.119: Allow each Home Service provider to decline/remove an open customer job from only their own dashboard.
alter table public.home_service_customer_jobs
  add column if not exists declined_by text[] not null default '{}';

create index if not exists home_service_customer_jobs_declined_by_idx
  on public.home_service_customer_jobs using gin (declined_by);
