Habesha Agenagn V7.8.108 — Unified Pending Admin Actions

New admin behavior:
- Pending transactions from every existing category are collected at the very top of the Admin Dashboard.
- Each pending transaction keeps its original Approve/Decline/action buttons.
- After admin acts, the dashboard refresh removes it from the top pending queue.
- The transaction remains visible in its original category management/summary section below with its updated status.
- Mobile card layout and desktop dashboard are preserved.
- No new SQL is required.

## V7.8.110 — New User Actions First
- Newly approved rental properties appear first for rental seekers.
- New rental viewing requests appear first for property owners.
- Owner property lists and seeker request history use newest-first order.
- Mobile transaction tables prioritize rows with real user actions before completed history.
- Existing workflows and database structure are unchanged; no SQL is required.

## V7.8.111 — Global Phone Action Ordering
- Applies to all user categories and roles on phone screens.
- Action-required/new transactions appear first.
- Active/in-progress items appear next.
- Completed/history items appear last.
- Newest items are first within each group.
- Desktop and admin workflows remain unchanged.
- No new SQL required.
