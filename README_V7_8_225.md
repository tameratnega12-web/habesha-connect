# Habesha Agenagn V7.8.225

Taxi/Limo customer ride request Supabase location-column match fix.

- Sends both the current `pickup` / `destination` fields and the live-table `pickup_location` / `dropoff_location` fields.
- Loads either naming format safely.
- No other module or flow changed.

Run `supabase/v7_8_225_taxi_ride_location_columns_match.sql` once in Supabase SQL Editor before testing.
