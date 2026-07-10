# Habesha Agenagn V7.8.117 — Customer-Posted Home Service Jobs

New Home Services workflow:
1. Customer posts the service they need.
2. Admin approves or declines it.
3. Providers with an approved matching service category see the job.
4. The first matching provider can accept it.
5. Provider marks the work complete.
6. Customer confirms completion.

## Required SQL
Run this once in Supabase SQL Editor before testing:
`supabase/v7_8_117_home_service_customer_jobs.sql`

The existing direct workflow where customers choose a listed provider is preserved.

## V7.8.118 Home Services Approval Reliability Fix
- Admin refresh now loads provider posts, direct customer requests, and customer-posted service jobs.
- Direct customer requests again require Admin approval before the provider receives them.
- Admin email notification restored for direct customer requests.
- Home Services records are included in the unified pending count/queue.
- Admin action lookup accepts both local and Supabase IDs.


## V7.8.119 — All Providers See Customer Service Requests
- After admin approval, every Home Service provider can see the customer-posted job at the top under How It Works.
- Providers can Accept or Decline / Remove.
- Accept is allowed only when the job category matches one of the provider’s approved service categories.
- Decline removes the job only from that provider’s page; other providers can still see it.
- Run `supabase/v7_8_119_home_service_provider_declines.sql` once in Supabase.

## V7.8.120 Home Service Admin Dashboard Fix
Run `supabase/v7_8_120_home_service_admin_dashboard_fix.sql` once in Supabase SQL Editor. This allows the signed-in Admin Dashboard to load and approve pending provider service posts and direct Home Service requests.


## V7.8.121 Rebuilt from V7.8.120
This version uses V7.8.120 as the stable base and changes only Home Services action ordering: accepted customer jobs, provider Mark Work Complete, and customer Confirm Completed appear at the top. No new SQL is required.

V7.8.124 update: direct listed-provider Home Service requests now show their current status at the top for customer/provider, and the customer listing button changes from Request Service to Waiting for Admin, Waiting for Provider, or Accepted. Duplicate active requests are blocked. No SQL required.
