# Habesha Agenagn V7.8.241

Business Directory photo gallery update only.

## Added
- Up to 6 gallery photos per business profile.
- Direct phone/computer multi-photo upload.
- 5 MB maximum per gallery photo.
- Owners can delete individual gallery photos.
- Gallery appears below the business information.
- Logo, cover, and gallery photos open in a large viewer when tapped/clicked.
- Mobile responsive gallery and full-screen photo viewer.
- Gallery changes return the business profile to Pending Admin Approval.

## Database / SQL
No new SQL is required if `supabase/v7_8_239_business_logo_cover_storage.sql` was already run. The gallery uses the same `business-media` bucket and stores its photo list in the existing business profile details.

## Scope
No Shipping, Rentals, Trucking, Taxi/Limo, Marketplace, Home Services, Jobs, or other workflows were changed.
