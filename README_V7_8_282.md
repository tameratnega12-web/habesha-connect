# Habesha Agenagn V7.8.282

Marketplace photo upload now follows the same proven Supabase sequence used by Event Organizer:

1. Save the Marketplace listing first.
2. Use the returned listing UUID as the Storage folder.
3. Upload selected photos to `marketplace-media`.
4. Attach the public photo URLs to that exact listing.
5. Reload the listing from Supabase and verify every photo is present before reporting success.

## Required Supabase step
Run once:

`supabase/v7_8_282_marketplace_photo_event_pattern_fix.sql`

This update changes only Marketplace photo selection, upload, attachment, verification, and display behavior.
