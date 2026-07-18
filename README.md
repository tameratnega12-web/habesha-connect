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


## V7.8.350 Translation audit
- Base: V7.8.335.
- Imported the existing full-phrase Amharic dictionary from V7.8.347.
- Disabled partial and word-by-word translation fallback.
- Amharic mode changes text only when the entire displayed phrase exactly matches an existing translation entry.
- Existing mixed hard-coded phrases are corrected only when an exact dictionary entry exists.
- No workflow, Supabase, status, ID, form, or action logic was intentionally changed.

## V7.8.351 English-only
Removed the Amharic translation layer and language switcher. No workflow, Supabase, form, ID, status, or action logic was changed.
