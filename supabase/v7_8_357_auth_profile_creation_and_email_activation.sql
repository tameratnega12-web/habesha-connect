-- Habesha Agenagn V7.8.357
-- Fixes signup profile creation after email registration.
-- The profile is created by a SECURITY DEFINER trigger instead of a browser-side
-- upsert that can fail under RLS before the new user has an active session.

alter table if exists public.profiles
  add column if not exists auth_user_id uuid,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists role text default 'customer',
  add column if not exists roles text[] default array['customer']::text[],
  add column if not exists active_role text default 'customer',
  add column if not exists verified boolean default false,
  add column if not exists email_auto_activated_at timestamptz;

create unique index if not exists profiles_auth_user_id_unique
  on public.profiles(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists profiles_email_lower_unique
  on public.profiles(lower(email))
  where email is not null;

create or replace function public.hc_create_or_update_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
  v_role text;
  v_roles text[];
begin
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''), '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');
  v_role := coalesce(nullif(new.raw_user_meta_data->>'active_role',''), nullif(new.raw_user_meta_data->>'role',''), 'customer');

  begin
    select coalesce(array_agg(value), array[v_role]::text[])
      into v_roles
      from jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'roles', jsonb_build_array(v_role)));
  exception when others then
    v_roles := array[v_role]::text[];
  end;

  insert into public.profiles(
    auth_user_id, name, phone, email, role, roles, active_role,
    verified, email_auto_activated_at
  ) values (
    new.id, v_name, v_phone, lower(new.email), v_role, v_roles, v_role,
    new.email_confirmed_at is not null,
    case when new.email_confirmed_at is not null then now() else null end
  )
  on conflict (auth_user_id) do update set
    name = coalesce(nullif(excluded.name,''), public.profiles.name),
    phone = coalesce(nullif(excluded.phone,''), public.profiles.phone),
    email = excluded.email,
    role = coalesce(nullif(public.profiles.role,''), excluded.role),
    roles = case
      when public.profiles.roles is null or cardinality(public.profiles.roles)=0 then excluded.roles
      else public.profiles.roles
    end,
    active_role = coalesce(nullif(public.profiles.active_role,''), excluded.active_role),
    verified = public.profiles.verified or excluded.verified,
    email_auto_activated_at = case
      when public.profiles.email_auto_activated_at is not null then public.profiles.email_auto_activated_at
      when excluded.verified then now()
      else null
    end;

  return new;
end;
$$;

drop trigger if exists hc_create_profile_after_auth_signup on auth.users;
create trigger hc_create_profile_after_auth_signup
after insert on auth.users
for each row
execute function public.hc_create_or_update_profile_from_auth();

drop trigger if exists hc_activate_profile_after_email_confirmation on auth.users;
create trigger hc_activate_profile_after_email_confirmation
after update of email_confirmed_at, raw_user_meta_data, email on auth.users
for each row
execute function public.hc_create_or_update_profile_from_auth();

-- Backfill or repair profiles for all existing Auth users.
insert into public.profiles(
  auth_user_id, name, phone, email, role, roles, active_role,
  verified, email_auto_activated_at
)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(coalesce(u.email,''), '@', 1)),
  coalesce(u.raw_user_meta_data->>'phone', ''),
  lower(u.email),
  coalesce(nullif(u.raw_user_meta_data->>'role',''), 'customer'),
  array[coalesce(nullif(u.raw_user_meta_data->>'role',''), 'customer')]::text[],
  coalesce(nullif(u.raw_user_meta_data->>'active_role',''), nullif(u.raw_user_meta_data->>'role',''), 'customer'),
  u.email_confirmed_at is not null,
  case when u.email_confirmed_at is not null then now() else null end
from auth.users u
on conflict (auth_user_id) do update set
  email = excluded.email,
  verified = public.profiles.verified or excluded.verified,
  email_auto_activated_at = case
    when public.profiles.email_auto_activated_at is not null then public.profiles.email_auto_activated_at
    when excluded.verified then now()
    else null
  end;

-- Users may read and edit only their own profile after authentication.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

grant select, update on public.profiles to authenticated;
