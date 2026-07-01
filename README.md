# Habesha Connect V6.8.0 Rental Dashboard & Analytics

This update improves the Rentals workflow after V6.7.8.

## Added
- Friendly rental IDs displayed as `HC-R0001`, `HC-R0002`, etc.
- Admin Rental Statistics: total properties, available, rented, viewing requests, owner fees, seeker fees, total rental revenue.
- Owner Rental Performance dashboard.
- Rent Seeker Activity dashboard.
- Improved Rental Requests Management table with seeker phone, payment amount, and status badges.
- Rental viewing requests are saved to Supabase `rental_requests` when possible.
- Owner/seeker/admin dashboards refresh rental requests from Supabase.

## Notes
- No SQL is required if your `rental_requests` table already exists from the base schema.
- If rental request saving fails because a column is missing, use the existing Supabase schema or send the error message for a focused migration.
