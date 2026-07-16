Habesha Agenagn V7.8.324
Taxi customer ride and approved driver UUID match fix.
Run supabase/v7_8_323_taxi_driver_auth_uuid_match.sql before testing.

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

V7.8.318: Taxi/Limo Driver open customer rides now visibly shows Accept Ride and Decline after admin approval. Customer ride acceptance remains driver-only.

V7.8.319: Fixed the original Taxi/Limo driver open-ride table renderer so an admin-approved driver profile always receives Accept Ride and Decline buttons for an unclaimed ride with status Approved - Waiting Driver. Hired / Not Available employment status does not block customer ride actions. No SQL change.


V7.8.320: Fixed Taxi/Limo customer ride action visibility for hired, admin-approved drivers. Owner/vehicle assignment no longer hides Accept/Decline.

V7.8.321: Taxi customer rides now match only an active hired driver assignment (Approved taxi_limo_driver_assignments record by driver email).


V7.8.322: Taxi/Limo customer rides match any admin-approved driver application. Owner/vehicle assignment is not required for Accept/Decline.

## V7.8.326
Removed only the Taxi/Limo customer ride-request feature:
- Customer Request Ride task and form
- Driver Open Customer Rides and My Ride Activity tasks
- Customer ride-request records from Taxi/Limo admin display
- Ride-specific Supabase SQL files

Taxi/Limo owner applications, vehicles, driver applications, owner-driver jobs, hiring, and assignments were not changed.


V7.8.326: Fixed only the Home Services customer Agree action. The signed-in Customer role is now recognized correctly, and after agreement the accepted provider name, phone, and email are shown.


V7.8.327: Fixed only the Home Services customer Agree action Supabase client check. No SQL changes.
