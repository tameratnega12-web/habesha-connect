# Habesha Agenagn V7.8.206

## Focused transaction routing correction

- Traveler Open Shipping renders only shipment requests and the next available actions.
- Open Trip renders only the Post Traveler Trip form.
- My Open Trips renders only active posted traveler trips.
- The separation is enforced in the Shipping renderer, so later data refreshes cannot restore unrelated sections.
- Existing workflows, approvals, emails, contact-release rules, and database structure are unchanged.
- No SQL is required.
