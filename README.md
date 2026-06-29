# Habesha Connect V6.2 Admin Verification Center

This update keeps V6.1 multi-role accounts and adds admin verification connected to Supabase.

## Added
- Admin dashboard loads users from Supabase `profiles`
- Verify / Unverify users updates the real `profiles.verified` field
- Verified badge updates for travelers and senders
- Admin user search supports name, email, phone, and services
- Clear separation: admin verifies accounts; shipment space reduces automatically after traveler accepts

## How to use
1. Upload/replace these files in GitHub.
2. Commit: `V6.2 Admin Verification Center`.
3. Wait for Vercel redeploy.
4. Log in with an account that has the `admin` role.
5. Open Admin and verify users.

## Important
If you do not yet have a real admin account, add `admin` to your own profile `roles` array in Supabase and set `active_role` to `admin`, then log out and back in.
