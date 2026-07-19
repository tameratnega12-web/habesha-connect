# Habesha Agenagn V7.8.354

## Marketplace seller request visibility fix

Fixed only the Marketplace transaction flow:

1. Seller posts an item.
2. Admin approves the listing.
3. Customer requests the item.
4. Admin approves the customer request.
5. The approved request appears on the correct seller dashboard with Accept and Decline.
6. Seller accepts or declines.
7. Admin approves a seller-accepted transaction.
8. Customer clicks Agree.
9. Seller name, phone, and email are released to the customer.

## Required Supabase step

Run once in Supabase SQL Editor:

`supabase/v7_8_354_marketplace_seller_request_visibility_flow.sql`

The ZIP includes the complete current Supabase SQL folder. No other category workflow was changed.
