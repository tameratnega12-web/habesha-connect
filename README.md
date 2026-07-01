# Habesha Connect V6.7.7 Rentals Pay & Save Fix

This update fixes the rental workflow.

## Fixes

- Owner pays the listing fee at the time of publishing.
- Property is saved to Supabase `properties` table after payment.
- Admin can see paid rental listings for approval.
- Rent seekers can see listings after Admin approval.
- Old draft-first / pay-later workflow is replaced by `Pay $25 & Publish Property`.

## Commit message

V6.7.7 Rentals Pay and Save Fix

## SQL

No new SQL required if your `properties` table already exists.
