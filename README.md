# Habesha Connect V6.6 - Shipping Payout Plan

This update adds the Version 1 payout workflow for shipping:

1. Sender requests traveler space.
2. Traveler accepts.
3. Sender pays Habesha Connect.
4. Admin approves payment and space is reserved.
5. Contact information is shown after admin approval.
6. Package is delivered.
7. Admin manually pays traveler commission by Zelle, PayPal, Cash App, bank transfer, or cash.
8. Admin clicks **Pay Traveler** to record the payout.

Optional SQL migration:

`supabase/v6_6_traveler_payout_migration.sql`

Run it once in Supabase SQL Editor to store traveler payout status in the cloud database.

Commit message:

`V6.6 Shipping Payout Plan`
