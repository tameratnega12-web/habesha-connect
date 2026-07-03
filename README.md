# Habesha Agenagn App - V7.3.7 Email API Integration

This build connects app email notifications to a Vercel serverless API endpoint using Resend.

## What changed

- Added `api/send-email.js` for Vercel email sending.
- App notifications call `/api/send-email` directly.
- Added Admin Dashboard button: **Send Test Email**.
- Uses `RESEND_API_KEY` from Vercel Environment Variables.
- Default sender: `Habesha Agenagn <notifications@habeshaagenagnapp.com>`.
- Admin placeholder emails are routed to `habeshaconnect@gmail.com` by default.

## Required Vercel Environment Variable

Already completed:

`RESEND_API_KEY`

Optional variables:

- `RESEND_FROM_EMAIL` = `Habesha Agenagn <notifications@habeshaagenagnapp.com>`
- `ADMIN_NOTIFICATION_EMAIL` = your admin inbox
- `REPLY_TO_EMAIL` = your support inbox

## Test

After deploying:

1. Login as admin.
2. Open Admin Dashboard.
3. Click **Send Test Email**.
4. Check inbox and spam folder.

No SQL needed for this update.
