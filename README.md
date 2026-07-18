# Habesha Agenagn V7.8.350 — Home Service Agree Mouse + Phone Fix

Changed only the customer Home Service action-card input handler.

- Mouse: primary-button `mousedown` now starts Agree, Decline, and Confirm actions.
- Phone/tablet: existing `touchend` support remains.
- Keyboard: synthetic click activation remains supported.
- The existing busy lock prevents duplicate submissions from follow-up browser events.
- No Supabase SQL, transaction status, notification, or other category code was changed.

Deploy the included `index.html`. The V7.8.349 SQL still applies; no new SQL is required.
