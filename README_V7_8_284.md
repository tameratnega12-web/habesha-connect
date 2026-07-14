# Habesha Agenagn V7.8.284

Marketplace photo upload stability fix only.

- Removed the repeated Marketplace MutationObserver/controller that kept the page busy.
- Uses one photo selection and upload controller.
- Keeps selected previews without repeatedly rebuilding the page.
- Restores the Submit button after success or error.
- Saves the listing, uploads photos, attaches URLs, and verifies the Supabase row.
- No new SQL is required if V7.8.282 SQL was already run.
