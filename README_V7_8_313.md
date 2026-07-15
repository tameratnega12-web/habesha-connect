# Habesha Agenagn V7.8.312 — Rentals Photo Gallery Stable Fix

Rental-only update based on the working Business Profile and Event Organizer upload pattern.

## Fixed
- Property owners can select up to 6 rental photos.
- Owners can choose photos more than once before posting; selections accumulate up to 6.
- Duplicate file selections are ignored.
- Selected photos remain visible instead of appearing and disappearing.
- Owners can remove an individual selected photo before posting.
- Each file is limited to 5 MB and must be an image.
- Photos upload under `<auth.uid>/<property_id>/<filename>` in `rental-property-media`.
- The property record is created first and is preserved even if a photo upload fails.
- Saved rental photos reload from Supabase and can be enlarged by owners and seekers.
- Selected files are cleared only after a successful property submission.

## Supabase
Run `supabase/v7_8_312_rental_photo_gallery_stable_fix.sql` once in Supabase SQL Editor. It is safe to run again.

## Scope
Only Rentals photo selection/upload code and the Rental photo Storage SQL were changed. Other categories and workflows were not modified.

## Rental flow verified/aligned
Owner posts property → Admin approves property → Seeker requests viewing → Admin approves request for owner review → Owner accepts or declines → If accepted, seeker clicks Request Owner Information → Owner contact is released.

The unnecessary second/final admin approval after the owner accepted was removed from the active Rental flow.

## V7.8.313 Rental owner Accept / Decline fix
- Rental-only update.
- Uses the authenticated property owner ID instead of depending on a copied owner email.
- Adds an atomic Supabase function for Accept and Decline.
- Accept marks the selected request Approved and the property Rented.
- Decline marks the request Declined and keeps the property Approved.
- Run: `supabase/v7_8_313_rental_owner_accept_decline_fix.sql`
