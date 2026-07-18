# Habesha Agenagn V7.8.353

## Exact fix
Business Owner profile -> Admin approval -> Customer Business Directory visibility.

The previous policy could let the Admin screen show a local Approved state while Supabase kept the row pending. V7.8.353 aligns the Business Directory table permissions with the project's existing custom sign-in architecture, synchronizes old approved status values, and keeps the current customer fresh-load code.

## Required Supabase step
Run this file once in Supabase SQL Editor:

`supabase/v7_8_353_business_directory_approval_visibility_alignment.sql`

Then deploy the included `index.html`, sign out/in or refresh, approve the business again if it is still pending, and open Customer -> Find Business.

## Package
This package contains the latest `index.html` and the complete current Supabase SQL folder. It contains no previous ZIPs, archived folders, verification reports, or duplicate project copies.
