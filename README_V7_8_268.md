# Habesha Agenagn V7.8.268

Taxi/Limo-only fix.

- Fixed the Add Vehicle / Submit Vehicle for Admin Approval button.
- Added reliable Supabase submission with visible error messages.
- Prevented duplicate plate submissions.
- Set Taxi/Limo buttons to type="button" so they cannot silently submit/reload a parent form.
- Added error handling for Taxi/Limo owner, driver, hiring, vehicle, and ride action buttons.
- No unrelated category code was changed.
- No new SQL is required when the V7.8.216, V7.8.91, V7.8.225, and V7.8.226 Taxi/Limo SQL files were already run.
