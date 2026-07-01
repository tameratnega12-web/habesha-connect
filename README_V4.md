# V6.9.1 Notes

- Supabase is now the source of truth for rental requests.
- Removes stale local-only rental request display.
- Saves rental_requests first, then records payment locally.
- Shows real Supabase error if saving fails.
- No SQL required.
