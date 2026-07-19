# Habesha Agenagn V7.8.356 — Hybrid Admin Workflow

Base: V7.8.355.

## Hybrid workflow
Admin remains responsible for:
- New-user account verification
- First-time and higher-risk listing/profile approval
- Shipping/travel, Taxi/Limo owner/driver/vehicle verification
- Payments, refunds, payouts, disputes, reports, suspicious activity, and account actions

Routine actions between approved users now bypass unnecessary admin approval:
- Jobs: applicant goes directly to employer
- Rentals: seeker request goes directly to property owner
- Trucking jobs: driver application goes directly to truck owner
- Trailer rentals: renter request goes directly to trailer owner; payment/admin control remains
- Marketplace: customer request goes directly to seller; after seller accepts, customer can Agree without another admin click
- Home Services: customer request goes directly to the approved provider

## Unchanged
- Existing category layouts and top activity sections
- User verification requirement
- Listing approval controls
- Payment/payout and dispute controls
- Supabase schema and existing SQL set

No new SQL is required for this workflow update. The ZIP contains the complete current Supabase folder.
