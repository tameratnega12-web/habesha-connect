# Habesha Agenagn V7.8.135

Marketplace approval flow repair for desktop and phone.

Flow:
1. Seller posts item.
2. Item remains visible to seller as Pending Admin Approval and admin receives notification/email.
3. Admin approves listing.
4. Approved item becomes visible to customers.
5. Customer requests item.
6. Admin receives notification/email and approves or declines request.
7. Seller accepts or declines the admin-approved request.
8. After seller accepts, customer can view seller name, phone, and email.

The request uses only status values supported by the existing Supabase marketplace check constraint. No new SQL is required.
