-- V7.7.4 Home Services final request/schema alignment
-- Fixes request saving with calendar/time, any city, review summary, and existing job_description constraints.

alter table if exists public.home_service_posts add column if not exists city text;
alter table if exists public.home_service_posts add column if not exists price text;
alter table if exists public.home_service_posts add column if not exists description text;
alter table if exists public.home_service_posts add column if not exists provider_phone text;

alter table if exists public.home_service_requests add column if not exists service_id uuid;
alter table if exists public.home_service_requests add column if not exists service_local_ref text;
alter table if exists public.home_service_requests add column if not exists service_title text;
alter table if exists public.home_service_requests add column if not exists customer_phone text;
alter table if exists public.home_service_requests add column if not exists city text;
alter table if exists public.home_service_requests add column if not exists preferred_date text;
alter table if exists public.home_service_requests add column if not exists preferred_time text;
alter table if exists public.home_service_requests add column if not exists details text;
alter table if exists public.home_service_requests add column if not exists notes text;
alter table if exists public.home_service_requests add column if not exists job_description text;
alter table if exists public.home_service_requests add column if not exists admin_approved_at timestamptz;
alter table if exists public.home_service_requests add column if not exists provider_responded_at timestamptz;

-- If an older table requires job_description, make sure old rows are backfilled.
update public.home_service_requests
set job_description = coalesce(job_description, details, notes, '')
where job_description is null;
