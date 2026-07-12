# Habesha Agenagn V7.8.199

Adds the missing reverse communication methods:

- Job seeker posts a work profile; business owners send direct job offers.
- Customer posts an Item Wanted request; marketplace sellers make offers.
- Truck owner/driver posts Trailer Needed; trailer owners make offers.
- Taxi/Limo driver posts availability; customers request the driver.

Every new post requires Admin approval. After a response is accepted, the responder agrees first and the original poster agrees second. Each side sees the other person's contact information only after clicking their own Agree button.

## Required database update
Run `supabase/v7_8_199_two_way_communication.sql` once in Supabase SQL Editor before testing these new flows.
