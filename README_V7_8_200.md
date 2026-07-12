# Habesha Agenagn V7.8.200 — Pre-Test Cleanup

This version prepares V7.8.199 for complete testing.

## Fixed
- Removed the obsolete rental override that was incorrectly embedded inside the Supabase CDN script tag.
- Corrected the Supabase CDN script loading.
- Added the expected `js/supabase-config.js` loader so the project no longer references a missing file.
- Added ownership-based Row Level Security policies for `community_matches`.
- Updated the application version marker to V7.8.200.
- Kept all V7.8.199 category flows and home-page actions unchanged.

## Supabase configuration
The new config loader preserves values already injected by your deployment. Before replacing your GitHub project, copy your current public Supabase URL and anon key into `js/supabase-config.js`, or keep your existing configured version of that file. Never put a Supabase service-role key in browser code.

## Required SQL
1. If not already run, run `supabase/v7_8_199_two_way_communication.sql`.
2. Then run `supabase/v7_8_200_secure_two_way_communication.sql`.

The security SQL assumes the Admin login email is `admin.habeshaconnect@gmail.com`. Change that email in the SQL first if your Admin account uses a different address.
