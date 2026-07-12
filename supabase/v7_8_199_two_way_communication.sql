create table if not exists public.community_matches (
  id text primary key,
  flow_type text not null,
  record_type text not null default 'post',
  parent_id text,
  poster_name text,
  poster_email text,
  poster_phone text,
  initiator_name text,
  initiator_email text,
  initiator_phone text,
  title text,
  city text,
  details text,
  status text not null default 'Pending Admin Approval',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_matches enable row level security;

drop policy if exists "community matches read" on public.community_matches;
create policy "community matches read" on public.community_matches for select using (true);

drop policy if exists "community matches insert" on public.community_matches;
create policy "community matches insert" on public.community_matches for insert with check (true);

drop policy if exists "community matches update" on public.community_matches;
create policy "community matches update" on public.community_matches for update using (true) with check (true);

drop policy if exists "community matches delete" on public.community_matches;
create policy "community matches delete" on public.community_matches for delete using (true);

create index if not exists community_matches_flow_status_idx on public.community_matches(flow_type,status);
create index if not exists community_matches_parent_idx on public.community_matches(parent_id);
