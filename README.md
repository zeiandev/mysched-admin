# mysched-admin

Admin UI for Sections and Classes on Supabase.

## Env

Copy `.env.example` to `.env.local` (locally) or set in Vercel Project → Settings → Environment Variables.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Supabase SQL

```sql
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.sections enable row level security;
alter table public.classes  enable row level security;

create policy if not exists sections_read on public.sections for select to authenticated using (true);
create policy if not exists classes_read  on public.classes  for select to authenticated using (true);

create policy if not exists sections_admin_rw on public.sections
for all to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy if not exists classes_admin_rw on public.classes
for all to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- integrity
alter table public.sections add constraint if not exists sections_code_uniq unique (code);
alter table public.classes  add constraint if not exists classes_no_dupe unique (section_id, day, start, "end", title);
alter table public.classes  add constraint if not exists classes_day_chk check (day between 1 and 7);
alter table public.classes  add constraint if not exists classes_time_order_chk
check (start ~ '^[0-2][0-9]:[0-5][0-9]$' and "end" ~ '^[0-2][0-9]:[0-5][0-9]$' and start::time < "end"::time);

-- FK
alter table public.classes drop constraint if exists classes_section_id_fkey;
alter table public.classes add constraint classes_section_id_fkey
  foreign key (section_id) references public.sections(id) on delete cascade;

-- admin helpers
create or replace function public.list_admins()
returns table(user_id uuid, email text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select a.user_id, u.email, a.created_at
  from public.admins a join auth.users u on u.id = a.user_id
  order by a.created_at desc;
$$;

create or replace function public.add_admin_by_email(p_email text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.admins(user_id)
  select id from auth.users where lower(email) = lower(p_email)
  on conflict do nothing;
end; $$;

create or replace function public.remove_admin_by_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.admins where user_id = p_user_id;
end; $$;

grant execute on function public.list_admins() to authenticated;
grant execute on function public.add_admin_by_email(text) to authenticated;
grant execute on function public.remove_admin_by_user(uuid) to authenticated;
