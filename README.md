# Habesha Agenagn V7.8.355

Display-only update for the Home dashboards.

## Fixed
- Business Owner: **Your New Activity** appears at the very top.
- Job Seeker: **Your New Activity** appears at the very top.
- Marketplace: **Your New Activity** appears at the very top.

## Unchanged
- Business and Jobs workflows
- Marketplace request, Accept/Decline, Agree, and contact-release flow
- Supabase tables, policies, RPCs, and SQL
- All other categories

The ZIP includes the complete current Supabase folder from V7.8.354. No new SQL is required for this display-only change.

## V7.8.357 — Email-Verified Account Auto-Activation
- Removed the normal manual-admin approval requirement for new accounts.
- Supabase email confirmation now activates the matching `profiles` row automatically.
- Existing email-confirmed users are backfilled as active by the included SQL migration.
- Admin notification for every new registration was removed.
- Other category approvals and transaction workflows were not changed.

Run `supabase/v7_8_356_email_verified_account_auto_activation.sql` once in Supabase SQL Editor before testing.


V7.8.357 signup profile fix:
- Supabase Auth trigger now creates the profile automatically.
- Removed the browser-side profile upsert that failed under RLS before email confirmation.
- Run supabase/v7_8_357_auth_profile_creation_and_email_activation.sql once.

## V7.8.358 — Reused Email Profile Reconciliation
- Fixes the duplicate `profiles_email_key` error from V7.8.357.
- Reuses and reconnects an existing profile row by email instead of inserting a duplicate.
- Safely repairs existing Auth users and profiles.
- Keeps automatic activation after Supabase email confirmation.
- No category or transaction workflows were changed.

Run only this new correction SQL now:
`supabase/v7_8_358_reused_email_profile_reconciliation.sql`

This script is safe to run after the failed or partial V7.8.357 migration.
