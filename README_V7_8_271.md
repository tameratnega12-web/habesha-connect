# Habesha Agenagn V7.8.271

Taxi/Limo hiring flow fix only.

- Taxi/Limo owner sends a hire request to an approved driver.
- The driver sees **Agree** and **Decline** on the Home page and Taxi/Limo page.
- Clicking **Agree** saves the existing `Pending Admin Approval` status in Supabase.
- The owner's name, company, phone, email, and assigned vehicle are shown immediately.
- A **View Owner Information** button remains available while the request is pending admin approval and after approval.
- Existing final admin approval and hired-driver flow is unchanged.
- Phone and desktop buttons use the same handler.
- No new SQL is required.
