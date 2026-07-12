# Habesha Agenagn V7.8.213

## Rental single-flow cleanup

Removed the reverse Rental Wanted communication flow.

Kept the original rental flow:
1. Property owner posts a property.
2. Admin approves it.
3. Rent seeker opens approved rentals and submits a request.
4. Admin approves the request.
5. Property owner accepts or declines.
6. The seeker requests/views owner information at the approved stage.

Rental Quick Actions remains at the top of the rent seeker home page. Old Rental Wanted records are hidden from current rental listings. No new SQL is required.
