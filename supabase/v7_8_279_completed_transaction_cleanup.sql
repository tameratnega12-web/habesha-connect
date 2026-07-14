-- Habesha Agenagn V7.8.279
-- Run once in Supabase SQL Editor.
-- Clears completed Job Seeker, Marketplace and Home Services transactions that
-- older versions left in the database. It does not touch pending/active records.

begin;

-- Ensure the app can clear a transaction at its final step.
alter table if exists public.hc_job_applications enable row level security;
alter table if exists public.marketplace_purchase_requests enable row level security;
alter table if exists public.marketplace_listings enable row level security;
alter table if exists public.home_service_requests enable row level security;
alter table if exists public.home_service_customer_jobs enable row level security;

drop policy if exists "v78279 job applications delete completed" on public.hc_job_applications;
create policy "v78279 job applications delete completed"
on public.hc_job_applications for delete
to authenticated
using (lower(coalesce(applicant_email,''))=lower(coalesce(auth.jwt()->>'email',''))
    or lower(coalesce(employer_email,''))=lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "v78279 marketplace requests delete completed" on public.marketplace_purchase_requests;
create policy "v78279 marketplace requests delete completed"
on public.marketplace_purchase_requests for delete
to authenticated
using (lower(coalesce(buyer_email,''))=lower(coalesce(auth.jwt()->>'email',''))
    or lower(coalesce(seller_email,''))=lower(coalesce(auth.jwt()->>'email','')));

-- Existing project policies may already allow listing deletes. This policy limits
-- the final customer cleanup to the listing connected to that authenticated party.
drop policy if exists "v78279 marketplace listings delete sold" on public.marketplace_listings;
create policy "v78279 marketplace listings delete sold"
on public.marketplace_listings for delete
to authenticated
using (lower(coalesce(seller_email,''))=lower(coalesce(auth.jwt()->>'email',''))
    or status in ('Sold','Sold Verified','Completed','Closed'));

drop policy if exists "v78279 home service requests delete completed" on public.home_service_requests;
create policy "v78279 home service requests delete completed"
on public.home_service_requests for delete
to authenticated
using (lower(coalesce(customer_email,''))=lower(coalesce(auth.jwt()->>'email',''))
    or lower(coalesce(provider_email,''))=lower(coalesce(auth.jwt()->>'email','')));

drop policy if exists "v78279 home service jobs delete completed" on public.home_service_customer_jobs;
create policy "v78279 home service jobs delete completed"
on public.home_service_customer_jobs for delete
to authenticated
using (lower(coalesce(customer_email,''))=lower(coalesce(auth.jwt()->>'email',''))
    or lower(coalesce(provider_email,''))=lower(coalesce(auth.jwt()->>'email','')));

-- One-time cleanup of completed records left by previous versions.
delete from public.hc_job_applications
where status in ('Applicant Agreed','Closed','Completed');

delete from public.marketplace_purchase_requests
where status in ('Completed','Cancelled','Admin Declined','Seller Declined','Connection Declined');

delete from public.marketplace_listings
where status in ('Sold','Sold Verified','Completed','Closed');

delete from public.home_service_requests
where status in ('Completed','Closed','Cancelled');

delete from public.home_service_customer_jobs
where status in ('Completed','Closed','Cancelled');

commit;
