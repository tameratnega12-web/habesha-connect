-- Habesha Connect V7.1.2 trucking role constraint fix
-- Run this once in Supabase SQL Editor if you see:
-- profiles_role_check violation when saving Truck Owner / Driver roles.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in (
    'admin',
    'owner',
    'rent_seeker',
    'sender',
    'traveler',
    'customer',
    'truck_owner',
    'driver',
    'business_owner'
  ));

-- Optional: make sure active_role also supports the same role names if you added a check constraint manually.
alter table public.profiles
  drop constraint if exists profiles_active_role_check;

alter table public.profiles
  add constraint profiles_active_role_check
  check (active_role is null or active_role in (
    'admin',
    'owner',
    'rent_seeker',
    'sender',
    'traveler',
    'customer',
    'truck_owner',
    'driver',
    'business_owner'
  ));
