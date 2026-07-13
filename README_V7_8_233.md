Habesha Agenagn V7.8.233

Taxi/Limo customer ride driver-accept Admin visibility fix only.

After an approved Taxi/Limo driver accepts an Admin-approved customer ride:
- Supabase saves Driver Accepted - Waiting Admin Approval.
- Admin email is sent after the successful save.
- The transaction appears in the top Pending Admin Actions queue.
- The Taxi/Limo Admin section shows Approve Driver and Decline Driver.
- Customer Agree remains unavailable until Admin approves the driver.

No SQL change is required. Other modules were not changed.
