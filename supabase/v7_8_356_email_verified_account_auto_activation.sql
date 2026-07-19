-- Habesha Agenagn V7.8.356
-- Automatically activates a profile after Supabase confirms the user's email.
-- Manual admin approval is no longer required for normal account registration.

alter table if exists public.profiles
  add column if not exists email_auto_activated_at timestamptz;

create or replace function public.hc_activate_profile_after_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and (old.email_confirmed_at is null or old.email_confirmed_at is distinct from new.email_confirmed_at) then
    update public.profiles
       set verified = true,
           email_auto_activated_at = coalesce(email_auto_activated_at, now())
     where auth_user_id = new.id
        or lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

drop trigger if exists hc_activate_profile_after_email_confirmation on auth.users;
create trigger hc_activate_profile_after_email_confirmation
after update of email_confirmed_at on auth.users
for each row
execute function public.hc_activate_profile_after_email_confirmation();

-- Backfill existing users whose email is already confirmed.
update public.profiles p
   set verified = true,
       email_auto_activated_at = coalesce(p.email_auto_activated_at, now())
  from auth.users u
 where (p.auth_user_id = u.id or lower(p.email) = lower(u.email))
   and u.email_confirmed_at is not null
   and p.email_auto_activated_at is null;
