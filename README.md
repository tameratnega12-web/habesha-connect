# Habesha Connect V5.1 Production Cleanup

This version keeps real Supabase authentication and removes demo reset controls.

## Added / changed
- Removed the red Reset Test Data button from the header.
- Removed Reset Test Data from admin actions.
- Admin navigation is visible only to admin users.
- Admin dashboard card on home page is visible only to admin users.
- Top-right user display shows real signed-in name and role.
- Logout continues to use Supabase sign-out.

## Live deployment
Upload these files to GitHub and commit. Vercel will redeploy automatically.
