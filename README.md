# Habesha Agenagn V7.4.4 - Email Traveler Sender Request Step 3

Only email notification change added in this version:
- Traveler receives an email when a Sender requests luggage space on the Traveler's trip.

No SQL needed.
No database structure changes.
No workflow, button, UI, routing, authentication, or unrelated module changes.

V7.4.5 Step 4 Email Update:
- Added sender email notification when traveler accepts a luggage space request.
- Updated sender decline email subject/content for traveler declined request.
- No SQL/database changes.
- No workflow/UI/routing changes.


V7.4.7 Email Sender Package Delivered
- Added one email notification only: when a shipment is marked Delivered, the sender receives 'Your Package Has Been Delivered'.
- No SQL changes. No workflow, UI, routing, or database structure changes.


V7.4.8 Email Traveler Payout Released
- Added one email notification only: when Admin marks traveler payout paid, the traveler receives 'Your Payout Has Been Released'.
- No SQL, database, UI, routing, or workflow changes.

V7.4.9 Email Admin Truck Job Posted
- Added one email notification trigger only.
- When a Truck Owner posts a driver hiring job and it is saved successfully, Admin receives an email.
- Subject: Truck owner posted a job
- No SQL changes.
- No database structure changes.
- No UI/routing/workflow changes.


V7.5.0 Email Admin Truck Driver Application
- Added admin email when a truck driver applies for a trucking job.
- Subject: New Truck Driver Application
- No SQL changes.
- No workflow, UI, routing, or database changes.


## V7.5.1 Email Owner Driver Application
- Added email to Truck Owner when a Truck Driver applies for their job.
- No SQL changes. No workflow/UI/database changes.


## V7.5.6 Email Admin Property Published
- Added Admin email notification when a Property Owner publishes/submits a rental property.
- Subject: New Property Published.
- No SQL changes. No rental workflow, UI, authentication, or database structure changes.


V7.5.8: Added Rentals email notification for Property Owner when a Seeker requests a viewing. No SQL changes.


V7.6.0 Update: Added/confirmed seeker email notification when a rental viewing request is declined. No SQL/database changes.


## V7.6.2 Trucking Trailer Rent Admin Approval
- Trailer rent listings now show at the top of Truck Owner/Driver dashboard after Admin approval.
- New trailer rent posts go to Admin first with status: Pending Admin Approval.
- Trailer rental requests go to Admin first with status: Request Pending Admin Approval.
- Trailer owner sees the rental request only after Admin approves it.
- Only Trucking trailer rent flow was changed.
- Run: supabase/v7_6_2_trucking_trailer_admin_approval.sql

V7.6.3 Trucking Trailer Owner Request Top Panel
- Added a top Truck Owner dashboard section for Admin-approved trailer rental requests waiting for owner decision.
- No database or SQL changes required.
- Only Trucking trailer rent UI ordering/visibility was changed.

V7.6.4 Trucking Trailer Dashboard Priority Layout
- Moved approved Trailer Rentals Available to the very top of the Trucking Driver/Owner dashboard.
- Admin-approved trailer rental requests remain at the top of the Trailer Owner dashboard for owner approve/decline.
- No SQL required; uses V7.6.2 trailer approval fields.
- Only Trucking Trailer Rent layout was adjusted.

## V7.7.0 Home Services added

This version adds a separate Home Services module without changing the previous Shipping, Rentals, Marketplace, Trucking, Trailer Rentals, Business, Auth, or Admin workflows.

New Supabase migration:
- `supabase/v7_7_0_home_services.sql`

Run this SQL in Supabase before testing Home Services with the live database.

Home Services workflow:
- Service Provider submits provider profile.
- Admin approves provider profile.
- Customer can browse approved providers and request service.
- Provider accepts, declines, marks in progress, and completes jobs.
- Payments remain direct between customer and provider in Phase 1.
