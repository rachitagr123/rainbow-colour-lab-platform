-- Rainbow Colour Lab · Album Desk · 015
-- Add "manager" role: same as admin for rates / bills / reports, but cannot manage users.
-- Also creates test login: agrawal / agrawalrainbow123
-- Run once in Supabase → SQL Editor, after 014.

begin;

-- Allow manager in profiles.role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'manager', 'staff'));

-- Admin = full access including users. Office = admin or manager (prices, customers, reports).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and approved
  )
$$;

create or replace function public.is_office() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'manager') and approved
  )
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved)
$$;

revoke execute on function public.is_office() from public, anon;
grant execute on function public.is_office() to authenticated;

-- Business data: office (admin + manager). User admin RPCs stay is_admin-only.
drop policy if exists "admin manages items" on public.items;
create policy "office manages items" on public.items
  for all to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin manages sizes" on public.item_sizes;
create policy "office manages sizes" on public.item_sizes
  for all to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin only" on public.item_size_prices;
create policy "office prices" on public.item_size_prices
  for all to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin updates customers" on public.customers;
create policy "office updates customers" on public.customers
  for update to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin deletes customers" on public.customers;
create policy "office deletes customers" on public.customers
  for delete to authenticated using (public.is_office());

drop policy if exists "admin only" on public.customer_rates;
create policy "office customer rates" on public.customer_rates
  for all to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin updates orders" on public.orders;
create policy "office updates orders" on public.orders
  for update to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin deletes orders" on public.orders;
create policy "office deletes orders" on public.orders
  for delete to authenticated using (public.is_office());

drop policy if exists "admin only" on public.order_line_amounts;
create policy "office line amounts" on public.order_line_amounts
  for all to authenticated using (public.is_office()) with check (public.is_office());

drop policy if exists "admin only" on public.order_amounts;
create policy "office order amounts" on public.order_amounts
  for all to authenticated using (public.is_office()) with check (public.is_office());

-- Create manager test account (idempotent)
do $$
declare
  v_id uuid;
  v_email text := 'agrawal@rainbowcolourlabs.com';
  v_username text := 'agrawal';
  v_password text := 'agrawalrainbow123';
begin
  select id into v_id from auth.users where email = v_email;
  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('username', v_username, 'full_name', 'Agrawal', 'phone', null),
      now(), now(), '', '', '', '', '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id, v_id::text,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  else
    update auth.users
    set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
        updated_at = now()
    where id = v_id;
  end if;

  insert into public.profiles (id, username, role, approved, full_name)
  values (v_id, v_username, 'manager', true, 'Agrawal')
  on conflict (id) do update
    set role = 'manager',
        approved = true,
        username = excluded.username,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
end $$;

commit;

notify pgrst, 'reload schema';
