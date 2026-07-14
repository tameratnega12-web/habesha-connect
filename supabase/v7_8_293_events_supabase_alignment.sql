-- Habesha Agenagn V7.8.293
-- Events-only Supabase schema alignment.
-- Safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  local_ref text,
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
  status text not null default 'Pending Admin Approval',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_events add column if not exists local_ref text;
alter table public.community_events add column if not exists title text;
alter table public.community_events add column if not exists category text;
alter table public.community_events add column if not exists organizer_name text;
alter table public.community_events add column if not exists organizer_email text;
alter table public.community_events add column if not exists phone text;
alter table public.community_events add column if not exists email text;
alter table public.community_events add column if not exists description text;
alter table public.community_events add column if not exists event_date date;
alter table public.community_events add column if not exists start_time text;
alter table public.community_events add column if not exists end_time text;
alter table public.community_events add column if not exists venue text;
alter table public.community_events add column if not exists address text;
alter table public.community_events add column if not exists city text;
alter table public.community_events add column if not exists state text;
alter table public.community_events add column if not exists zip text;
alter table public.community_events add column if not exists admission text default 'Free';
alter table public.community_events add column if not exists adult_price numeric default 0;
alter table public.community_events add column if not exists child_price numeric default 0;
alter table public.community_events add column if not exists vip_price numeric default 0;
alter table public.community_events add column if not exists capacity integer default 0;
alter table public.community_events add column if not exists flyer_url text;
alter table public.community_events add column if not exists social_link text;
alter table public.community_events add column if not exists status text default 'Pending Admin Approval';
alter table public.community_events add column if not exists details jsonb default '{}'::jsonb;
alter table public.community_events add column if not exists created_at timestamptz default now();
alter table public.community_events add column if not exists updated_at timestamptz default now();

create unique index if not exists community_events_local_ref_uidx
  on public.community_events(local_ref)
  where local_ref is not null;
create index if not exists community_events_status_idx on public.community_events(status);
create index if not exists community_events_date_idx on public.community_events(event_date);
create index if not exists community_events_organizer_email_idx on public.community_events(lower(organizer_email));

alter table public.community_events enable row level security;

drop policy if exists "community events authenticated read" on public.community_events;
create policy "community events authenticated read"
on public.community_events for select
to authenticated
using (true);

drop policy if exists "community events authenticated insert" on public.community_events;
create policy "community events authenticated insert"
on public.community_events for insert
to authenticated
with check (true);

drop policy if exists "community events authenticated update" on public.community_events;
create policy "community events authenticated update"
on public.community_events for update
to authenticated
using (true)
with check (true);

drop policy if exists "community events authenticated delete" on public.community_events;
create policy "community events authenticated delete"
on public.community_events for delete
to authenticated
using (true);

grant select, insert, update, delete on public.community_events to authenticated;
