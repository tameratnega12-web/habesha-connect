-- V7.7.3 Home Services city/calendar fix
-- Run this if your Home Services request gives an error about missing city column.

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
