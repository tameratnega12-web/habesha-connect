# Habesha Agenagn V7.8.280

Marketplace photo upload fix only.

## What changed
- Marketplace sellers can choose photos directly from a phone or computer.
- Up to 6 photos, 5 MB each.
- Photos upload to the Supabase `marketplace-media` Storage bucket.
- The listing is saved first, permanent public photo URLs are attached, then the existing admin-approval and buyer/seller transaction flow continues.
- Multiple photo selections can be added before submitting.
- Selected photos show previews and can be removed.
- Submit is protected from double taps while photos upload.
- Existing Marketplace request, seller acceptance, admin approval, customer agreement, contact release, and completed-record cleanup logic remains unchanged.

## Required Supabase step
Run once:

`supabase/v7_8_280_marketplace_photo_storage.sql`
