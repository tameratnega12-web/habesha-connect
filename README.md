Habesha Agenagn V7.8.316

Home layout only: Marketplace, Customer, Job Seeker, and Event Organizer keep all task buttons at the top while Your New Activity and introductory role heading cards are removed. No workflow, Supabase, form, email, or SQL changes.

# Habesha Agenagn V7.8.312

Base: corrected V7.8.311.

Home-page layout changes only:
- Shipping Traveler: removed Your New Activity and the Traveler Quick Actions heading card; kept Open Trip and View Requests task buttons at the top.
- Shipping Sender: removed Your New Activity and the Sender Quick Actions heading card; kept Available Travelers and Post Item to Ship task buttons at the top.
- Property Owner: removed Your New Activity and the Property Owner Quick Actions heading card; kept Add Property and View Rent Seekers task buttons at the top.
- Rent Seeker: removed Your New Activity and the Rent Seeker heading card; kept Find Rentals and existing owner-information actions at the top.
- Existing Truck Owner and Truck Driver V7.8.311 layout remains unchanged.

No task behavior, forms, statuses, Supabase logic, email logic, or other workflows were changed.
No new SQL is required.


V7.8.313 — Taxi/Limo, Business, and Home Service Provider home layout only
- Taxi/Limo Owner: task buttons remain at the top; Your New Activity and Quick Actions heading card removed.
- Taxi/Limo Driver: task buttons remain at the top; Your New Activity and Quick Actions heading card removed.
- Business Owner: task buttons remain at the top; Your New Activity and Quick Actions heading card removed.
- Home Service Provider: task buttons remain at the top; Your New Activity and Quick Actions heading card removed.
- No Supabase, SQL, form, email, button action, or transaction-flow changes.


V7.8.316: Taxi/Limo customer ride flow updated only. After admin approval, an approved Taxi/Limo owner or driver can accept or decline. After acceptance, the customer must click Agree before provider contact information is shown. No SQL change required.


V7.8.316: Removed the Taxi/Limo Owner Ride Requests task and restricted customer ride acceptance to approved Taxi/Limo Drivers only. Flow: customer request, admin approval, driver accept/decline, customer Agree, driver contact release. No SQL changes.


V7.8.317 Taxi/Limo customer-driver flow fix:
- Run supabase/v7_8_317_taxi_customer_driver_flow_match.sql before testing.
- Customer request -> admin approval -> one approved driver accepts/declines -> customer agrees -> contacts released.
- Agreement/provider fields now restore from Supabase after refresh.
- Atomic ride acceptance prevents two drivers from claiming the same ride.
