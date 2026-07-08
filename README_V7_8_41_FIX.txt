Habesha Connect V7.8.41 Button No-Wait Fix

Built from the working V7.8.33 code the user uploaded.

Fixes:
- Normal navigation buttons do not call Supabase every time.
- My Services, Marketplace, Trucking, Shipping, Rentals, Profile, and role switching render from local app data immediately.
- Role switching saves locally first and syncs Supabase in the background.
- Logout clears the screen immediately and signs out from Supabase in the background.
- Admin and real submit/approve/pay actions still use Supabase.

No SQL needed.
