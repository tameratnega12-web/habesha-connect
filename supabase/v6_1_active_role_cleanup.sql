-- Optional V6.1 cleanup: set active_role to the first saved role when it is still customer.
update public.profiles
set active_role = coalesce(role, roles[1], 'customer')
where active_role = 'customer'
  and role is not null
  and role <> 'customer';
