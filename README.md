# Habesha Agenagn V7.8.352

Fixes only the approved Business Directory profile visibility for customers.

Changes:
- Customer Business Directory now forces a fresh Supabase load whenever opened instead of reusing a cached empty list.
- Added one Supabase RLS policy allowing anon/authenticated users to select approved public business profiles only.
- Owner/admin workflow, profile form, approval action, jobs, and all other categories are unchanged.

Deployment:
1. Replace the deployed `index.html` with this one.
2. Run `supabase/v7_8_352_business_directory_customer_visibility.sql` once in Supabase SQL Editor.
3. Open the Customer page, click **Find Business**, and verify the approved profile appears.
