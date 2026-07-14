# Habesha Agenagn V7.8.287 — Shipping Sender & Traveler Consent

Only the Shipping agreement/contact-release flow was changed.

## New flow
1. Traveler accepts the sender request.
2. Sender opens **Read & Agree / Continue to Payment**, reads the detailed prohibited-items agreement, checks the certification box, and agrees.
3. Sender payment proceeds through the existing payment step.
4. Traveler opens **Read & Agree** and accepts the traveler agreement.
5. Admin can approve only after both consent records exist.
6. Contact information is released only after both parties agreed and Admin approved.

## Required Supabase SQL
Run once:
`supabase/v7_8_287_shipping_dual_consent.sql`

The SQL adds consent flags, timestamps, agreement-version fields, and secure participant-only consent functions for both shipping tables.
