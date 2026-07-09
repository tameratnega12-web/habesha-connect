# Habesha Connect V7.8.80 Business Directory Flow

This version keeps the existing V7.8.79 Jobs feature and fixes the Business Directory approval flow.

## Business Directory flow fixed

1. Business owner opens **Business Directory**.
2. Business owner fills the directory profile and clicks **Save Business Profile**.
3. The profile is saved as **Pending Admin Approval**.
4. Admin receives an email notification for approval.
5. Admin opens **Admin** page and sees the Business Directory approval row.
6. Admin clicks **Approve**.
7. The action changes to **Approved** and stays in the admin page.
8. Approved directory is visible on the customer Business Directory dashboard.
9. Admin can delete any pending, declined, or approved directory. Deleted approved directories are removed from customer view.

## Supabase SQL

The Jobs SQL is still included:
- `supabase/v7_8_79_jobs.sql`

New Business Directory SQL is included:
- `supabase/v7_8_80_business_directory.sql`

Run `v7_8_80_business_directory.sql` in Supabase SQL Editor if Business Directory approval does not save, admin page is empty, or approved items come back as pending.
