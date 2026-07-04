# Habesha Connect V7.3.2 Payment History Fix

Fixes Admin Payment History so old browser/local beta payment records no longer appear.

Changes:
- Clears cached local payment history on app load.
- Admin Payment History now uses Supabase `payments` table as the source of truth.
- If Supabase `payments` is empty, Admin page shows no payments.
- New recorded payments are inserted into Supabase when connected.

No SQL migration required.

V7.4.0 Email Notification Module
- Added Vercel serverless email API: api/send-email.js
- Uses RESEND_API_KEY already configured in Vercel.
- Optional environment variables:
  - RESEND_FROM_EMAIL=Habesha Agenagn <notifications@habeshaagenagnapp.com>
  - SUPPORT_EMAIL=support@habeshaagenagnapp.com
- No Supabase table changes required.
- No workflow/database structure changes made.
