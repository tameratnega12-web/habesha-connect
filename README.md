# Habesha Connect V7.2.3 Workflow Fixes

Updates included:
- Shipping traveler trip date validation: no past trips and minimum 5 days before flight.
- Shipping remaining space is recalculated and active trips are sorted to the top.
- When Admin marks a shipment delivered, the related traveler trip is removed from sender availability.
- After traveler payout, contact details remain admin-only.
- Rental request approval refreshes immediately without needing manual browser refresh.
- Rentals keep completed/approved request records until users/admin delete them.
- Truck owner dashboard includes Post Job shortcut.
- Driver dashboard includes See Jobs shortcut.
- Truck insurance and registration expiration warnings added, including expired and 30-day soon alerts.
- Driver applications are shown in truck owner dashboard and confirmation appears after applying.

No new SQL migration is required for these frontend workflow fixes.
