# Habesha Agenagn V7.8.307 — Rentals Finished Photo Upload

Rental-only update:
- Removed the obsolete duplicate Rental controller while preserving the active Rental workflow.
- Property photos upload to the public `rental-property-media` Supabase Storage bucket.
- The property is saved first; its database ID becomes the photo folder.
- Photo URLs are attached to the same property and verified after reload.
- The SQL supports `properties.id` and `properties.owner_id` whether they are UUID or text columns.
- Property photos display after refresh and open in a larger viewer on phone and laptop.
- No other category was changed.

## Required Supabase step
Run once:

`supabase/v7_8_307_rental_property_photo_storage.sql`
