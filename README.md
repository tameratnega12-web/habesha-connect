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
