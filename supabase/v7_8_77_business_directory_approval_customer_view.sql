-- Habesha Agenagn V7.8.77
-- Business Directory approval + customer visibility support

alter table public.business_records add column if not exists status text default 'Pending Admin Approval';
alter table public.business_records add column if not exists updated_at timestamptz default now();
create index if not exists business_records_type_status_idx on public.business_records(record_type,status);

-- If older rows saved status only inside details, copy it to the top-level status column.
update public.business_records
set status = details->>'status',
    updated_at = now()
where record_type = 'business_profile'
  and details ? 'status'
  and coalesce(details->>'status','') <> ''
  and coalesce(status,'Pending Admin Approval') <> details->>'status';

-- Keep approved businesses readable by authenticated users. App filters public/customer view to Approved only.
alter table public.business_records enable row level security;

drop policy if exists "business_records_select_all_authenticated" on public.business_records;
create policy "business_records_select_all_authenticated"
on public.business_records
for select
to authenticated
using (true);
