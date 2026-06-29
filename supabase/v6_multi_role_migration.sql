-- Habesha Connect V6.0 multi-role account migration
-- Run this once in Supabase SQL Editor before testing V6.0 role switching.

alter table public.profiles
  add column if not exists roles text[] default '{}';

alter table public.profiles
  add column if not exists active_role text default 'customer';

update public.profiles
set roles = array[coalesce(role, 'customer')]
where roles is null or array_length(roles, 1) is null;

update public.profiles
set active_role = coalesce(active_role, role, 'customer')
where active_role is null;
