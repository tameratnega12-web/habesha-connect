# Habesha Agenagn V7.8.315

Base: V7.8.314.

Change: fixes only the Truck Driver Agree button inside Open Trucking by using the real Supabase application ID (`dbId` when present), matching the same accepted statuses used to display the card, preventing duplicate clicks, and calling the existing Trucking agreement update.

No new SQL is required.
