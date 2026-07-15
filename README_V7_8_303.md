# Habesha Agenagn V7.8.303

Marketplace listing status constraint fix.

## Required Supabase step
Run once:

`supabase/v7_8_303_marketplace_listing_status_match.sql`

This aligns the secure Marketplace create-listing function with the human-readable status values used by the existing Marketplace workflow. No other category was changed.
