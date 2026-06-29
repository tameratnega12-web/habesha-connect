# Habesha Connect V6.1 Multi-Role Accounts

V6.1 changes Habesha Connect from **one account = one role** to **one account = many services**.

A user can now use one email and phone number for:
- Traveler
- Sender
- Property Owner
- Rent Seeker
- Truck Driver
- Business Owner
- Customer

## Important Supabase step

Before testing V6.1, run this file in Supabase SQL Editor:

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



## Added in V6.1
- Completed top role switcher.
- Users can keep one account and switch between enabled services.
- My Services saves roles to Supabase.
- Active role updates in Supabase and controls dashboard/menu.
