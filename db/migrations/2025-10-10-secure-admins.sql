-- Enable RLS on admins
alter table public.admins enable row level security;

-- Only existing admins can read the admins table
create policy admins_read on public.admins
for select to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Only admins can add/remove admins (direct writes)
create policy admins_write on public.admins
for all to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Harden SECURITY DEFINER helpers
create or replace function public.add_admin_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'forbidden';
  end if;

  insert into public.admins(user_id)
  select id from auth.users where lower(email) = lower(p_email)
  on conflict do nothing;
end;
$$;

create or replace function public.remove_admin_by_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'forbidden';
  end if;

  delete from public.admins where user_id = p_user_id;
end;
$$;

-- Limit who can EXECUTE the helpers
revoke execute on function public.add_admin_by_email(text) from authenticated;
revoke execute on function public.remove_admin_by_user(uuid) from authenticated;
grant execute on function public.add_admin_by_email(text) to authenticated;
grant execute on function public.remove_admin_by_user(uuid) to authenticated;
