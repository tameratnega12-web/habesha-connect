# Habesha Agenagn V7.8.310

Rental-only fix: selected property photos now remain selected and visible when the Rentals page re-renders the Add Property form. The uploader uses the preserved File objects during submission and clears them only after a successful property/photo save. No other category was changed. No new SQL is required beyond the V7.8.307 Rental photo SQL.
