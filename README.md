# Habesha Connect V6.0 Multi-Role Accounts

V6.0 changes Habesha Connect from **one account = one role** to **one account = many services**.

A user can now use one email and phone number for:
- Traveler
- Sender
- Property Owner
- Rent Seeker
- Truck Driver
- Business Owner
- Customer

## Important Supabase step

Before testing V6.0, run this file in Supabase SQL Editor:

`supabase/v6_multi_role_migration.sql`

This adds:
- `profiles.roles`
- `profiles.active_role`

## Upload steps

1. Upload/replace these files in GitHub.
2. Commit changes.
3. Wait for Vercel to redeploy.
4. Open the live site.
5. Go to **My Services** and add/switch roles.

