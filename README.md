# Habesha Agenagn V7.8.81 - Business Directory Jobs Flow

Updated flow:

1. Home/menus now show **Job Seekers** instead of Jobs.
2. Business owners post jobs inside **Business Directory**.
3. Job post goes to Admin as **Pending Admin Approval**.
4. Admin receives email notification for approval.
5. Admin can approve, decline, or delete job posts.
6. Approved jobs appear in the **Job Seekers** dashboard.
7. Job seekers contact the business directly by phone or email. No Apply button is required.

Business Directory flow remains:
- Business owner submits directory profile.
- Admin gets email approval.
- Admin approval changes status to Approved and stays visible.
- Admin can delete.
- Approved directory shows in customer Business Directory dashboard.

SQL:
- Keep using `supabase/v7_8_79_jobs.sql` for jobs tables.
- Keep using `supabase/v7_8_80_business_directory.sql` for business directory tables.
