# Habesha Agenagn V7.8.302

Marketplace-only posting and photo upload rebuild.

## Fixed
- Corrects Marketplace listing INSERT RLS.
- Uses a secure Supabase function that assigns the signed-in seller ID and email.
- Saves the listing first, then uploads photos, then attaches and verifies photo URLs.
- Keeps all form values and selected photos if Supabase returns an error or the Marketplace panel re-renders.
- Clears the form only after the entire listing and photo process succeeds.
- Phone and laptop supported.

## Required Supabase step
Run once:

`supabase/v7_8_302_marketplace_post_rls_rebuild.sql`

This update changes only Marketplace posting/photo submission.
