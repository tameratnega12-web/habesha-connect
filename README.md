Habesha Agenagn V7.4.1 Email White Screen Fix

Fix scope:
- Email notification module only.
- Restored the missing currentUser initialization that caused the page to stop rendering after V7.4.0.
- No database or workflow changes.
- No SQL needed.

Deploy:
1. Upload this full package to GitHub/Vercel.
2. Make sure RESEND_API_KEY remains set in Vercel Environment Variables.
3. Test desktop and phone.
