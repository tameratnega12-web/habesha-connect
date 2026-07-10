V7.8.117 adds customer-posted Home Service jobs with admin approval, category matching, provider acceptance, provider completion, and customer confirmation. Run the included V7.8.117 SQL once.

V7.8.118 fixes Home Services admin email and missing approval transactions.


## V7.8.119 — All Providers See Customer Service Requests
- After admin approval, every Home Service provider can see the customer-posted job at the top under How It Works.
- Providers can Accept or Decline / Remove.
- Accept is allowed only when the job category matches one of the provider’s approved service categories.
- Decline removes the job only from that provider’s page; other providers can still see it.
- Run `supabase/v7_8_119_home_service_provider_declines.sql` once in Supabase.
