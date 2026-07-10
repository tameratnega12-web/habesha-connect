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
