# Habesha Agenagn V7.8.228

Taxi/Limo customer ride navigation fix only.

- The Taxi/Limo Driver home activity card for an Admin-approved open customer ride now opens the Open Customer Rides section directly.
- The card is shown only for rides with status `Approved - Waiting Driver` that the current driver has not declined.
- No ride status flow, Supabase schema, or other module was changed.
- No SQL is required.
