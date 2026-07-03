# Habesha Connect Email Notifications Setup

This update adds email notifications using a Supabase Edge Function and Resend.

## 1. Create a Resend account

Create a Resend account and get an API key.

For first testing, you can use Resend's default sender:

`Habesha Connect <onboarding@resend.dev>`

Later, after you buy/connect a domain, replace it with your own verified sender email.

## 2. Set Supabase secrets

In your terminal, inside the project folder, run:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set FROM_EMAIL="Habesha Connect <onboarding@resend.dev>"
supabase secrets set REPLY_TO_EMAIL="your-email@example.com"
```

## 3. Deploy the function

```bash
supabase functions deploy send-email-notification
```

## 4. Test from the app

After deployment, upload this app version to GitHub/Vercel.

Emails will be sent when the app creates a notification for a specific user email, such as:

- Admin approval needed
- Shipping request updates
- Rental request updates
- Truck job/application updates
- Payment/payout updates

Notifications sent to `all` remain in the app only and are not emailed.

## Notes

- No SQL migration is required for this update.
- The Resend API key must stay in Supabase secrets only. Do not put it in `index.html` or GitHub.
- For best reliability, verify your own sending domain in Resend before public launch.
