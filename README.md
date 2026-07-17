# Habesha Agenagn V7.8.334B

Amharic Translation Pass 2 — Shipping user interface.

Changes are limited to user-visible Shipping text:
- Traveler and Sender task cards
- Shipping forms, labels, placeholders, tables, statuses, and empty states
- Shipping action buttons
- Sender/Traveler consent screens
- Shipping alerts, confirmations, and common browser dialogs

No workflow, Supabase, SQL, internal status value, function, ID, or business logic was changed.
No SQL is required.

## V7.8.335 — Require Admin Verification Before Access
- New signups remain signed out and cannot enter the Customer dashboard.
- Login and restored Supabase sessions are blocked until `profiles.verified = true`.
- Admin accounts remain accessible.
- No SQL changes required.
