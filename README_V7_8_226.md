# Habesha Agenagn V7.8.226

Taxi/Limo customer ride status constraint fix only.

## Fixed
- Updated the Supabase `taxi_ride_requests` status constraint to match every status used by the current customer ride flow.
- Normalizes known legacy ride statuses before applying the new constraint.
- Keeps the V7.8.225 pickup/drop-off column compatibility fix.

## Required Supabase step
Run once:

`supabase/v7_8_226_taxi_ride_status_constraint_match.sql`

No other module or flow was changed.
