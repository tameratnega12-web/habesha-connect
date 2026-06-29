# Habesha Connect V4.2 Authentication Upload Steps

This version connects the Login, Create Account, Logout, and Forgot Password buttons to Supabase Auth.

## Upload to GitHub
1. Open your GitHub repository: `habesha-connect`.
2. Click **Add file → Upload files**.
3. Upload/replace these files from this package:
   - `index.html`
   - `js/supabase-config.js`
   - `docs/AUTH_UPLOAD_STEPS.md`
4. Click **Commit changes**.
5. Wait for Vercel to redeploy automatically.

## Test
1. Open your live Vercel URL.
2. Click **Login / Register**.
3. Create a new account with a real email.
4. Go to Supabase → Authentication → Users.
5. You should see the new user.
6. Go to Supabase → Table Editor → profiles.
7. You should see the matching profile row.

## Notes
- The local admin login remains as emergency fallback: `admin@habeshaconnect.com / admin123`.
- Real Supabase admin should be created later and marked as `admin` in the `profiles` table.
