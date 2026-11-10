-- Rainbow Colour Lab · Album Desk · 002: staff sign-up with admin approval
-- Run once in Supabase → SQL Editor, after setup.sql. Keeps all existing data.
--
-- New accounts are always role "staff" and start unapproved. Until admin approves them
-- they can sign in but cannot read or write any Album Desk data.

-- ───────────────────────── Profile fields ─────────────────────────
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists approved boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

update public.profiles set approved = true where username in ('admin', 'rcolourlab');

-- ───────────────────────── Role helpers ─────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and approved)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved)
$$;

-- Every new login is unapproved staff; admin is only ever granted by SQL.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, role, approved, full_name, phone)
  values (
    new.id,
    lower(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1))),
    'staff',
    false,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ───────────────────────── Only approved accounts see data ─────────────────────────
drop policy if exists "signed-in can read items" on public.items;
create policy "approved can read items" on public.items
  for select to authenticated using (public.is_staff());

drop policy if exists "signed-in can read sizes" on public.item_sizes;
create policy "approved can read sizes" on public.item_sizes
  for select to authenticated using (public.is_staff());

drop policy if exists "signed-in can read customers" on public.customers;
create policy "approved can read customers" on public.customers
  for select to authenticated using (public.is_staff());

drop policy if exists "signed-in can add customers" on public.customers;
create policy "approved can add customers" on public.customers
  for insert to authenticated with check (public.is_staff());

drop policy if exists "signed-in can read orders" on public.orders;
create policy "approved can read orders" on public.orders
  for select to authenticated using (public.is_staff());

drop policy if exists "signed-in can read order lines" on public.order_lines;
create policy "approved can read order lines" on public.order_lines
  for select to authenticated using (public.is_staff());

-- ───────────────────────── Create order: approved accounts only ─────────────────────────
create or replace function public.create_order(
  p_customer_id bigint,
  p_album_name text,
  p_notes text,
  p_phone text,
  p_order_date date,
  p_lines jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_cust customers%rowtype;
  v_order orders%rowtype;
  v_item items%rowtype;
  v_size item_sizes%rowtype;
  v_line jsonb;
  v_line_id bigint;
  v_qty int;
  v_rate numeric;
  v_total numeric := 0;
  v_sort int := 0;
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
begin
  if not public.is_staff() then
    raise exception 'Your account is waiting for admin approval';
  end if;

  select * into v_cust from customers where id = p_customer_id;
  if not found then
    raise exception 'Customer not found';
  end if;

  if v_phone is not null and coalesce(v_cust.phone, '') = '' then
    update customers set phone = v_phone where id = v_cust.id;
  end if;

  insert into orders (customer_id, customer_name, phone, album_name, notes, order_date, created_by)
  values (
    v_cust.id,
    v_cust.name,
    coalesce(v_phone, v_cust.phone),
    nullif(trim(coalesce(p_album_name, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    coalesce(p_order_date, (now() at time zone 'Asia/Kolkata')::date),
    auth.uid()
  )
  returning * into v_order;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop
    v_qty := nullif(v_line ->> 'qty', '')::int;
    continue when v_qty is null or v_qty <= 0;

    select * into v_size from item_sizes where id = (v_line ->> 'item_size_id')::bigint;
    if not found then
      raise exception 'Unknown item size in order';
    end if;
    select * into v_item from items where id = v_size.item_id;

    v_rate := coalesce(
      (select rate from customer_rates where customer_id = v_cust.id and item_size_id = v_size.id),
      (select default_rate from item_size_prices where item_size_id = v_size.id),
      0
    );

    v_sort := v_sort + 1;
    insert into order_lines (order_id, item_id, item_size_id, item_name, category, size, qty, sort)
    values (v_order.id, v_item.id, v_size.id, v_item.name, v_item.category, v_size.size, v_qty, v_sort)
    returning id into v_line_id;

    insert into order_line_amounts (line_id, rate, amount)
    values (v_line_id, v_rate, v_rate * v_qty);

    v_total := v_total + v_rate * v_qty;
  end loop;

  if v_sort = 0 then
    raise exception 'Add at least one item with a quantity';
  end if;

  insert into order_amounts (order_id, total, advance) values (v_order.id, v_total, 0);

  return jsonb_build_object('id', v_order.id, 'order_no', v_order.order_no);
end $$;

-- ───────────────────────── Public sign-up ─────────────────────────
-- Creates a confirmed login directly, so no confirmation email is needed for the
-- made-up @rainbowcolourlabs.com addresses. The account still needs admin approval.
create or replace function public.sign_up_staff(p_username text, p_password text, p_full_name text, p_phone text)
returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
declare
  v_username text := lower(trim(coalesce(p_username, '')));
  v_name text := trim(coalesce(p_full_name, ''));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_email text;
  v_id uuid := gen_random_uuid();
begin
  if v_username !~ '^[a-z0-9][a-z0-9._-]{2,29}$' then
    raise exception 'Login ID must be 3–30 letters or numbers (dot, dash and underscore allowed)';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  if v_name = '' then
    raise exception 'Please enter your name';
  end if;

  v_email := v_username || '@rainbowcolourlabs.com';
  if exists (select 1 from profiles where username = v_username)
     or exists (select 1 from auth.users where email = v_email) then
    raise exception 'That login ID is already taken';
  end if;
  if (select count(*) from profiles where not approved) >= 20 then
    raise exception 'Too many accounts are waiting for approval. Please ask the admin.';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('username', v_username, 'full_name', v_name, 'phone', v_phone),
    now(), now(), '', '', '', '', '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
          'email', now(), now(), now());
end $$;

-- ───────────────────────── Admin: manage accounts ─────────────────────────
drop function if exists public.admin_list_users();
create function public.admin_list_users()
returns table (
  id uuid, username text, role text, full_name text, phone text,
  approved boolean, created_at timestamptz, last_sign_in_at timestamptz
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can do this';
  end if;
  return query
    select p.id, p.username, p.role, p.full_name, p.phone, p.approved, p.created_at, u.last_sign_in_at
    from public.profiles p join auth.users u on u.id = p.id
    order by p.approved, p.role, p.username;
end $$;

create or replace function public.admin_set_approved(p_user_id uuid, p_approved boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can do this';
  end if;
  if exists (select 1 from profiles where id = p_user_id and role = 'admin') then
    raise exception 'Admin access cannot be changed here';
  end if;
  update profiles set approved = p_approved where id = p_user_id;
end $$;

create or replace function public.admin_delete_user(p_user_id uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can do this';
  end if;
  if exists (select 1 from profiles where id = p_user_id and role = 'admin') then
    raise exception 'The admin account cannot be deleted';
  end if;
  delete from auth.users where id = p_user_id;
end $$;

revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.admin_list_users() from public, anon;
revoke execute on function public.admin_set_approved(uuid, boolean) from public, anon;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_approved(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.sign_up_staff(text, text, text, text) to anon, authenticated;
