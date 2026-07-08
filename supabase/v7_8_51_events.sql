-- V7.8.51 Events table
create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  local_ref text unique,
  title text not null,
  category text,
  organizer_name text,
  organizer_email text,
  phone text,
  email text,
  description text,
  event_date date,
  start_time text,
  end_time text,
  venue text,
  address text,
  city text,
  state text,
  zip text,
  admission text default 'Free',
  adult_price numeric default 0,
  child_price numeric default 0,
  vip_price numeric default 0,
  capacity integer default 0,
  flyer_url text,
  social_link text,
  status text default 'Pending Admin Approval',
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.community_events enable row level security;
do $$ begin
  create policy "community_events_select" on public.community_events for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "community_events_insert" on public.community_events for insert with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "community_events_update" on public.community_events for update using (true) with check (true);
exception when duplicate_object then null; end $$;
