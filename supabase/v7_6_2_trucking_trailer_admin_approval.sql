-- Habesha Agenagn V7.6.2 Trucking Trailer Rent Admin Approval
-- Only changes the default status for new trailer rental posts.
-- Existing tables/data are preserved.

alter table public.trailer_rentals
  alter column status set default 'Pending Admin Approval';
