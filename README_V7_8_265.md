# Habesha Agenagn V7.8.265

## Truck job completion home-page cleanup

This update changes only the truck owner and truck driver job-application completion step.

After the accepted truck driver clicks **Agree**:

- The truck owner's name, phone number, and email are shown once.
- The selected truck job and driver application are marked complete in Supabase.
- The completed job/application is removed from the truck driver's Home and Trucking pages.
- The completed job/application is removed from the truck owner's Home and Trucking pages.
- Leftover agreement, final-approval, hired, completed, and history cards are filtered from both user home pages.
- No completion notice is added to either user's home page.
- Admin and the truck owner can still receive email notification.

No new SQL is required.
