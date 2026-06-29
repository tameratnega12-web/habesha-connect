# Habesha Connect V4.0 - Next Steps

## 1. Create the Supabase tables
Open Supabase → SQL Editor → New query.
Paste the full contents of `supabase/schema.sql` and click Run.

## 2. Get your Supabase keys
Open Supabase → Project Settings → API.
Copy:
- Project URL
- anon public key

## 3. Upload this project to GitHub
Open your GitHub repo `habesha-connect` → Add file → Upload files.
Upload everything inside this folder.
Commit changes.

## 4. Deploy to Vercel
Go to Vercel → Add New Project → Import `habesha-connect`.
Framework preset: Other.
Build command: leave blank.
Output directory: leave blank.
Click Deploy.

## 5. Important
This package prepares the project for Supabase. The current app UI still works like V3.6. The next coding step is replacing each LocalStorage action with Supabase database calls.
