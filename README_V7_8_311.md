# Habesha Agenagn V7.8.311

Rental-only fix:

- Corrects Supabase Storage RLS for property photo uploads.
- Rental photo files now use the folder format `<signed-in-user-id>/<property-id>/<filename>`.
- A photo upload failure no longer deletes the newly posted property.
- The property remains pending for Admin approval and the user sees the actual photo warning.
- No other category was changed.

Run once in Supabase SQL Editor:

`supabase/v7_8_311_rental_photo_storage_rls_fix.sql`
