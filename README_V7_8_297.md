# Habesha Agenagn V7.8.297

## All-category completed transaction cleanup

This update audits user-facing completed transaction visibility across:

- Shipping
- Rentals
- Trucking and Trailer
- Taxi/Limo
- Marketplace
- Home Services
- Business Jobs / Job Seekers
- Events

### Change

A final shared user-page filter prevents terminal records from being rebuilt by older renderers after refresh or role changes. Completed/closed/delivered/declined/sold/hired/rented/payment-received records are removed from user-facing Home and category activity panels.

Admin records remain available when needed for payout, verification, audit, or history. Active and pending transactions are unchanged.

No Supabase SQL is required.
