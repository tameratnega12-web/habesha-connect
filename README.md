# Habesha Connect V6.7.8 Safari Compatibility & All Buttons Refresh Fix

This update focuses on cross-device consistency.

## Fixes
- Rentals now reloads approved listings directly from Supabase every time the Rentals button/page opens.
- Admin refresh now reloads profiles, trips, shipments, and rentals.
- Page buttons now safely await async module loading where needed.
- Added visible loading state for rentals.
- Updated version footer to V6.7.8.
- Added cache-control meta tags to reduce stale Safari cache issues.

## No SQL needed
Use the existing database migrations already applied.
