# Habesha Agenagn V7.8.208

## Shipping status and Traveler action correction

- Uses one canonical shipping status flow for request creation, Supabase loading, focused views, Accept/Decline, payment, approval, and delivery.
- Open Shipping renders new sender requests with Accept and Decline buttons.
- Supports legacy status labels by normalizing them to the current status flow.
- Sender payment is available only after Traveler accepts.
- Open Trip remains separate from Open Shipping.
- No SQL is required.
