# Habesha Agenagn App V7.3.8 - Professional Email Notifications

This update improves email notifications and admin alerts.

## Added / Fixed
- Professional Habesha Agenagn email template.
- Branded email layout with Open Dashboard button.
- Admin email notifications for:
  - Traveler trip posts
  - Sender shipping space requests
  - Shipping transactions waiting for approval
  - Property listings waiting for approval
  - Rental viewing requests
  - Truck owner job posts
  - Truck driver job applications
  - Problem reports
  - Delivered shipment notices
- Improved email subject lines and message content.
- Basic branding update from Habesha Connect to Habesha Agenagn in main title/header/footer/about.

## Setup
No SQL needed.
Make sure Vercel has RESEND_API_KEY saved and redeploy after upload.

## V7.3.9 Cross-device Sync Fix
- Trips, shipments, and rental listings now use Supabase as the source of truth when Supabase is connected.
- Truck records, truck jobs, driver profiles, and driver applications are now saved to Supabase so phone/laptop/admin all see the same data.
- Run `supabase/v7_3_9_cross_device_sync.sql` once before testing trucking sync.
