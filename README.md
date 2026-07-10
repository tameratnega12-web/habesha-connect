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
