# Habesha Agenagn V7.8.240

Business Directory photo upload correction only.

- Removed visible Logo Image Link and Cover Image Link fields from the active Business Profile form.
- Business owners choose or take a logo and cover photo directly from a phone or computer.
- Uploads continue to use the existing `business-media` Supabase Storage bucket.
- Images remain connected to the exact `business_id`.
- No gallery or paid subscription rules were added.
- No other module was changed.

## Required Supabase setup
Run `supabase/v7_8_239_business_logo_cover_storage.sql` only if it has not already been run.
