Habesha Agenagn V7.4.4 - Truck Applications and Admin Transaction Refresh Fix

Fixes:
- Truck driver applications now load from Supabase with a fallback query if relationship joins fail.
- Driver dashboard shows Applied status after submitting a job application.
- Admin dashboard shows truck driver applications without needing manual refresh.
- Admin dashboard refreshes latest payment/transaction data after admin actions.

No new SQL required if v7_3_9_cross_device_sync.sql was already run.
