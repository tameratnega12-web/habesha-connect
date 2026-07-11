# Habesha Agenagn V7.8.150

Business Directory and Job Seeker flow review and correction.

- Approved jobs remain visible to job seekers with Apply This Job.
- Applicant Agree remains directly below How It Works after business acceptance.
- New job applications now appear directly below How It Works on the Business Owner dashboard with Accept and Decline.
- After applicant agreement, confirmed applicant contact information appears directly below How It Works on the Business Owner dashboard.
- Business Owner actions are no longer duplicated in the Job Seeker dashboard.
- Existing admin approval, email, Supabase, and other category workflows are unchanged.
- Phone and desktop layouts use the same responsive cards and actions.
- No new SQL is required.

## V7.8.151 Traveler Home Quick Actions
- Traveler home page now shows **Open Trip** and **View Requests** immediately after sign-in.
- Open Trip navigates directly to the traveler trip-posting form.
- View Requests navigates directly to the traveler sender-request section.
- Uses the existing responsive card grid and includes a delayed mobile fallback for reliable scrolling on phones.

## V7.8.152 Sender Home Quick Actions
- Added **Available Travelers** to the signed-in Sender home page.
- Added **Post Item to Ship** to the signed-in Sender home page.
- Each button opens Shipping and scrolls directly to the correct section.
- Uses the existing responsive card grid for desktop and phone layouts.


## V7.8.154
- Removed the Post Traveler Trip form from the Traveler View Requests screen.
- Open Trip still opens the Post Traveler Trip form directly.
- Verified responsive behavior for desktop and phone layouts.


## V7.8.155 Sender Available Travelers Cleanup
- Removed the Post Item to Ship form from the Available Travelers view.
- The form now appears only after the sender selects the separate Post Item to Ship home-page button.
- Preserved desktop and mobile navigation, available traveler listings, and item submission workflow.


## V7.8.156 – Shipping forms below How It Works
- Traveler Post Trip form is always shown directly below the Shipping How It Works note.
- Sender Post Item to Ship form is always shown directly below the Shipping How It Works note.
- Forms remain independent from View Requests and Available Travelers lists.
- Existing quick-action buttons scroll to the correct form/list on desktop and mobile.
