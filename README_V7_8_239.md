# Habesha Agenagn V7.8.239

Business Directory Stage 1 photo foundation:

- Business owners can upload one logo and one cover photo from phone or computer.
- Images are stored in the public `business-media` Supabase Storage bucket.
- Upload permission is restricted to the owner of the exact `business_id`.
- Public business profiles display the uploaded logo and cover photo.
- Logo limit: 2 MB. Cover photo limit: 5 MB.
- New or changed business profiles remain subject to Admin approval.

Run once in Supabase SQL Editor:

`supabase/v7_8_239_business_logo_cover_storage.sql`

No gallery or paid subscription logic is included in this version.
