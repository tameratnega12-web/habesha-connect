# Habesha Agenagn V7.8.315

Rental-only Accept/Decline Supabase alignment fix.

Run:
`supabase/v7_8_315_rental_owner_profile_id_status_alignment.sql`

Fixes:
- Matches `properties.owner_id` to the signed-in user's `profiles.id`.
- Recognizes `Pending Owner Review`, `Pending`, and `Waiting Owner Review` consistently.
- Removes the unsupported hard-coded `Closed` request status from the owner decision transaction.
- No other category changed.
