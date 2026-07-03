# Email Notifications Setup

This version uses Vercel Serverless Function:

`api/send-email.js`

You already verified the domain in Resend and added `RESEND_API_KEY` in Vercel.

## Required

Vercel → Project → Settings → Environment Variables:

- `RESEND_API_KEY`

## Optional

- `RESEND_FROM_EMAIL` = `Habesha Agenagn <notifications@habeshaagenagnapp.com>`
- `ADMIN_NOTIFICATION_EMAIL` = admin inbox to receive admin alerts
- `REPLY_TO_EMAIL` = reply-to address

## Test

After Vercel deployment finishes:

1. Login as admin.
2. Open Admin Dashboard.
3. Click **Send Test Email**.

The older Supabase Edge Function file is kept only as an alternative reference, but it is not required for this Vercel setup.
