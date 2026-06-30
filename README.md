# Habesha Connect V6.7.1 Listing Fee Validation Fix

Added:
- Traveler pays a $10 trip listing fee before publishing a trip.
- The trip becomes visible after the listing fee is recorded.
- If at least one shipment is completed for that trip, the $10 is added back to the traveler payout.
- Admin dashboard includes Traveler Listing Fees.
- Admin Settings includes Traveler Trip Listing Fee so the amount can be changed later.
- Old manual Create Shipment form stays removed; senders request space from traveler trip cards.

## Supabase step
Run once in SQL Editor:

`supabase/v6_7_traveler_listing_fee_migration.sql`

## Commit message
V6.7 Traveler Listing Fee Refund


## V6.7.1
Fixes false listing fee migration warning by using the correct Supabase column names (`listing_fee` and `listing_fee_refund`). No new SQL required if V6.7 SQL already succeeded.
