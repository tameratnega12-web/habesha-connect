# Habesha Agenagn V7.8.201 — Supabase Sign-In Restoration

## Fix included

- Restored the correct public Supabase Project URL and browser-safe publishable key in `js/supabase-config.js`.
- Restored Supabase authentication for Admin and all existing user accounts.
- Updated the application version marker to V7.8.201.
- Preserved all category workflows and the V7.8.200 security cleanup.

## Deployment

1. Upload the full V7.8.201 project to GitHub.
2. Wait for Vercel deployment to finish.
3. Hard-refresh the website or open it in a private/incognito window.
4. Test Admin sign-in first, then one normal user account.

## SQL

No additional SQL is required for V7.8.201. If the V7.8.200 security SQL was already run, do not run it again for this sign-in correction.

Never place a Supabase secret/service-role key in browser code.
