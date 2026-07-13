-- Habesha Agenagn V7.8.225 Taxi/Limo ride location column compatibility
-- Run once in Supabase SQL Editor. Safe to run more than once.

alter table public.taxi_ride_requests
  add column if not exists pickup_location text,
  add column if not exists dropoff_location text,
  add column if not exists pickup text,
  add column if not exists destination text;

update public.taxi_ride_requests
set pickup_location = coalesce(pickup_location, pickup),
    dropoff_location = coalesce(dropoff_location, destination),
    pickup = coalesce(pickup, pickup_location),
    destination = coalesce(destination, dropoff_location)
where pickup_location is null
   or dropoff_location is null
   or pickup is null
   or destination is null;

notify pgrst, 'reload schema';
