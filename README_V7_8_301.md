# Habesha Agenagn V7.8.301

Rebuilt only the customer-side Home Services actions.

- One controller owns customer Agree, Decline, and Confirm Completed.
- Provider-side V7.8.300 actions remain unchanged.
- Customer actions are saved atomically in Supabase.
- Confirm Completed and Decline remove the transaction from active pages.
- Direct phone touch and laptop click are supported.
- No other category was changed.

Run once in Supabase SQL Editor:

`supabase/v7_8_301_home_services_customer_actions.sql`
