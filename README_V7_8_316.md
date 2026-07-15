# Habesha Agenagn V7.8.316

Rental-only rebuild.

- Removed the overlapping Rental Accept/Decline patches.
- Added one Rental owner-decision function in the front end.
- Added one matching Supabase RPC: `rental_owner_decide_request_v78316`.
- Owner matching supports `properties.owner_id` stored as either `profiles.id` or `auth.users.id`.
- Rental request statuses are limited to `Pending Owner Review`, `Approved`, and `Declined` for this action.
- Accept marks the selected request `Approved`, the property `Rented`, and other pending requests `Declined`.
- Decline marks only that request `Declined` and keeps the property `Approved` unless already rented.
- No second admin approval is used after the owner responds.

Run `supabase/v7_8_316_rentals_clean_owner_decision_rebuild.sql` in Supabase before testing.
