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

## V7.8.356 — Email-Verified Account Auto-Activation
- Removed the normal manual-admin approval requirement for new accounts.
- Supabase email confirmation now activates the matching `profiles` row automatically.
- Existing email-confirmed users are backfilled as active by the included SQL migration.
- Admin notification for every new registration was removed.
- Other category approvals and transaction workflows were not changed.

Run `supabase/v7_8_356_email_verified_account_auto_activation.sql` once in Supabase SQL Editor before testing.
