-- Habesha Agenagn V7.8.358
-- Safely reconciles Supabase Auth users with an existing public.profiles row.
-- This fixes reused-email cases and may be run after a partial/failed V7.8.357 run.

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

-- Keep the existing email uniqueness rule. This index also protects mixed-case emails.
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
  v_changed integer := 0;
begin
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''), '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');
  v_role := coalesce(
    nullif(new.raw_user_meta_data->>'active_role',''),
    nullif(new.raw_user_meta_data->>'role',''),
    'customer'
  );

  begin
    select coalesce(array_agg(value), array[v_role]::text[])
      into v_roles
      from jsonb_array_elements_text(
        coalesce(new.raw_user_meta_data->'roles', jsonb_build_array(v_role))
      );
  exception when others then
    v_roles := array[v_role]::text[];
  end;

  -- Reuse the existing profile when the same email was registered before.
  update public.profiles p
     set auth_user_id = new.id,
         name = coalesce(nullif(p.name,''), v_name),
         phone = coalesce(nullif(p.phone,''), v_phone),
         email = lower(new.email),
         role = coalesce(nullif(p.role,''), v_role),
         roles = case
           when p.roles is null or cardinality(p.roles) = 0 then v_roles
           else p.roles
         end,
         active_role = coalesce(nullif(p.active_role,''), v_role),
         verified = coalesce(p.verified,false) or new.email_confirmed_at is not null,
         email_auto_activated_at = case
           when p.email_auto_activated_at is not null then p.email_auto_activated_at
           when new.email_confirmed_at is not null then now()
           else null
         end
   where lower(p.email) = lower(new.email);

  get diagnostics v_changed = row_count;

  -- If no row matched the email, update a row already linked to this Auth user.
  if v_changed = 0 then
    update public.profiles p
       set name = coalesce(nullif(p.name,''), v_name),
           phone = coalesce(nullif(p.phone,''), v_phone),
           email = lower(new.email),
           role = coalesce(nullif(p.role,''), v_role),
           roles = case
             when p.roles is null or cardinality(p.roles) = 0 then v_roles
             else p.roles
           end,
           active_role = coalesce(nullif(p.active_role,''), v_role),
           verified = coalesce(p.verified,false) or new.email_confirmed_at is not null,
           email_auto_activated_at = case
             when p.email_auto_activated_at is not null then p.email_auto_activated_at
             when new.email_confirmed_at is not null then now()
             else null
           end
     where p.auth_user_id = new.id;

    get diagnostics v_changed = row_count;
  end if;

  -- Only create a new profile when neither email nor Auth ID already exists.
  if v_changed = 0 then
    insert into public.profiles(
      auth_user_id, name, phone, email, role, roles, active_role,
      verified, email_auto_activated_at
    ) values (
      new.id, v_name, v_phone, lower(new.email), v_role, v_roles, v_role,
      new.email_confirmed_at is not null,
      case when new.email_confirmed_at is not null then now() else null end
    );
  end if;

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

-- Repair/backfill existing Auth users one at a time without inserting duplicate emails.
do $$
declare
  u record;
  v_role text;
  v_changed integer;
begin
  for u in
    select id, email, email_confirmed_at, raw_user_meta_data
    from auth.users
    where email is not null
  loop
    v_role := coalesce(
      nullif(u.raw_user_meta_data->>'active_role',''),
      nullif(u.raw_user_meta_data->>'role',''),
      'customer'
    );

    update public.profiles p
       set auth_user_id = u.id,
           name = coalesce(nullif(p.name,''), u.raw_user_meta_data->>'name', split_part(u.email,'@',1)),
           phone = coalesce(nullif(p.phone,''), u.raw_user_meta_data->>'phone', ''),
           email = lower(u.email),
           role = coalesce(nullif(p.role,''), v_role),
           roles = case
             when p.roles is null or cardinality(p.roles)=0 then array[v_role]::text[]
             else p.roles
           end,
           active_role = coalesce(nullif(p.active_role,''), v_role),
           verified = coalesce(p.verified,false) or u.email_confirmed_at is not null,
           email_auto_activated_at = case
             when p.email_auto_activated_at is not null then p.email_auto_activated_at
             when u.email_confirmed_at is not null then now()
             else null
           end
     where lower(p.email) = lower(u.email);

    get diagnostics v_changed = row_count;

    if v_changed = 0 then
      update public.profiles p
         set name = coalesce(nullif(p.name,''), u.raw_user_meta_data->>'name', split_part(u.email,'@',1)),
             phone = coalesce(nullif(p.phone,''), u.raw_user_meta_data->>'phone', ''),
             email = lower(u.email),
             role = coalesce(nullif(p.role,''), v_role),
             roles = case
               when p.roles is null or cardinality(p.roles)=0 then array[v_role]::text[]
               else p.roles
             end,
             active_role = coalesce(nullif(p.active_role,''), v_role),
             verified = coalesce(p.verified,false) or u.email_confirmed_at is not null,
             email_auto_activated_at = case
               when p.email_auto_activated_at is not null then p.email_auto_activated_at
               when u.email_confirmed_at is not null then now()
               else null
             end
       where p.auth_user_id = u.id;

      get diagnostics v_changed = row_count;
    end if;

    if v_changed = 0 then
      insert into public.profiles(
        auth_user_id, name, phone, email, role, roles, active_role,
        verified, email_auto_activated_at
      ) values (
        u.id,
        coalesce(u.raw_user_meta_data->>'name', split_part(u.email,'@',1)),
        coalesce(u.raw_user_meta_data->>'phone',''),
        lower(u.email),
        v_role,
        array[v_role]::text[],
        v_role,
        u.email_confirmed_at is not null,
        case when u.email_confirmed_at is not null then now() else null end
      );
    end if;
  end loop;
end;
$$;

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
