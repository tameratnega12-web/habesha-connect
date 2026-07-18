-- Habesha Connect V7.8.79 Jobs Feature
-- Run this in Supabase SQL Editor.
-- Adds general community Jobs tables without changing existing modules.

create extension if not exists pgcrypto;

create table if not exists public.hc_jobs (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  employer_email text,
  employer_name text,
  title text not null,
  company text,
  category text,
  city text,
  job_type text,
  pay text,
  description text,
  requirements text,
  contact_phone text,
  contact_email text,
  status text default 'Pending Admin Approval',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.hc_job_applications (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  job_id uuid references public.hc_jobs(id) on delete set null,
  job_local_ref text,
  job_title text,
  employer_email text,
  employer_name text,
  applicant_name text,
  applicant_email text,
  applicant_phone text,
  experience text,
  message text,
  status text default 'Pending Employer Review',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hc_jobs_status_idx on public.hc_jobs(status);
create index if not exists hc_jobs_employer_email_idx on public.hc_jobs(lower(employer_email));
create index if not exists hc_jobs_city_idx on public.hc_jobs(city);
create index if not exists hc_job_applications_job_local_ref_idx on public.hc_job_applications(job_local_ref);
create index if not exists hc_job_applications_employer_email_idx on public.hc_job_applications(lower(employer_email));
create index if not exists hc_job_applications_applicant_email_idx on public.hc_job_applications(lower(applicant_email));

alter table public.hc_jobs enable row level security;
alter table public.hc_job_applications enable row level security;

-- Clean existing policies for repeatable install.
drop policy if exists "hc_jobs_select_all" on public.hc_jobs;
drop policy if exists "hc_jobs_insert_auth" on public.hc_jobs;
drop policy if exists "hc_jobs_update_auth" on public.hc_jobs;
drop policy if exists "hc_jobs_delete_auth" on public.hc_jobs;

drop policy if exists "hc_job_applications_select_auth" on public.hc_job_applications;
drop policy if exists "hc_job_applications_insert_auth" on public.hc_job_applications;
drop policy if exists "hc_job_applications_update_auth" on public.hc_job_applications;
drop policy if exists "hc_job_applications_delete_auth" on public.hc_job_applications;

-- Public can read jobs so visitors/customers can browse approved listings.
-- The app itself filters pending jobs from normal customers.
create policy "hc_jobs_select_all"
on public.hc_jobs for select
using (true);

create policy "hc_jobs_insert_auth"
on public.hc_jobs for insert
to authenticated
with check (true);

create policy "hc_jobs_update_auth"
on public.hc_jobs for update
to authenticated
using (true)
with check (true);

create policy "hc_jobs_delete_auth"
on public.hc_jobs for delete
to authenticated
using (true);

create policy "hc_job_applications_select_auth"
on public.hc_job_applications for select
to authenticated
using (true);

create policy "hc_job_applications_insert_auth"
on public.hc_job_applications for insert
to authenticated
with check (true);

create policy "hc_job_applications_update_auth"
on public.hc_job_applications for update
to authenticated
using (true)
with check (true);

create policy "hc_job_applications_delete_auth"
on public.hc_job_applications for delete
to authenticated
using (true);
