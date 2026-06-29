# Habesha Connect V5.0 Supabase Auth

This version fixes the Supabase browser configuration so the app can actually call Supabase Authentication.

## What changed
- `js/supabase-config.js` now exposes `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`.
- The Account page shows Supabase auth connection status.
- Create Account requires terms/privacy agreement.
- Registration and login use Supabase Auth when connected.

## Upload steps
1. Upload/replace all files in GitHub.
2. Commit changes.
3. Wait for Vercel redeploy.
4. Open the live app.
5. Click Account and confirm Auth status says `Supabase connected`.
6. Create a new account.
7. Check Supabase → Authentication → Users.
