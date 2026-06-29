-- Optional: make your account the Habesha Connect admin.
-- Change the email if needed, then run once in Supabase SQL Editor.
update public.profiles
set roles = array(select distinct unnest(coalesce(roles, '{}') || array['admin'])),
    role = 'admin',
    active_role = 'admin',
    verified = true
where email = 'tameratnega12@gmail.com';
