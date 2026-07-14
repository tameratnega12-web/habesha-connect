# Habesha Agenagn V7.8.281

Marketplace photo upload repair only.

- Converts selected phone photos to JPEG before uploading, including HEIC when the phone browser can decode it.
- Uploads Marketplace photos to `marketplace-media`.
- Verifies that `photo_urls` are saved on the Marketplace listing.
- Adds an owner-authorized Supabase update policy and secure RPC fallback.
- Keeps the existing Marketplace approval/request/accept/admin/agree/cleanup flow unchanged.

Run once in Supabase SQL Editor:

`supabase/v7_8_281_marketplace_photo_attach_fix.sql`
