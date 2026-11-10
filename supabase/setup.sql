-- Rainbow Colour Lab · Album Desk
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Re-running WIPES all Album Desk data (customers, rates, orders) and reloads the defaults.
-- Login accounts in Supabase Auth are kept.
-- After this, also run 002, 003, 004 and 005 in order.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── Clean slate ─────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.create_order(bigint, text, text, text, date, jsonb) cascade;
drop function if exists public.admin_list_users() cascade;
drop function if exists public.admin_set_password(uuid, text) cascade;
drop table if exists public.order_line_amounts cascade;
drop table if exists public.order_amounts cascade;
drop table if exists public.order_lines cascade;
drop table if exists public.orders cascade;
drop table if exists public.customer_rates cascade;
drop table if exists public.customers cascade;
drop table if exists public.item_prices cascade;
drop table if exists public.item_size_prices cascade;
drop table if exists public.item_sizes cascade;
drop table if exists public.items cascade;
drop function if exists public.is_admin() cascade;
drop table if exists public.profiles cascade;
drop sequence if exists public.order_no_seq;

-- ───────────────────────── Users & roles ─────────────────────────
-- Login IDs are the part before "@": admin@rainbowcolourlabs.com → "admin".
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  role text not null check (role in ('admin', 'staff'))
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    case when split_part(new.email, '@', 1) = 'admin' then 'admin' else 'staff' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, username, role)
select id, split_part(email, '@', 1),
       case when split_part(email, '@', 1) = 'admin' then 'admin' else 'staff' end
from auth.users
on conflict (id) do nothing;

-- ───────────────────────── Items & prices ─────────────────────────
create table public.items (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null check (category in ('sheet', 'cover', 'box', 'product')),
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Every item is sold in one or more sizes, and each size has its own price.
create table public.item_sizes (
  id bigint generated always as identity primary key,
  item_id bigint not null references public.items on delete cascade,
  size text not null,
  sort int not null default 0,
  active boolean not null default true,
  unique (item_id, size)
);
create index item_sizes_item_idx on public.item_sizes (item_id);

-- Prices live in separate tables so staff can list items and sizes without ever seeing a rate.
create table public.item_size_prices (
  item_size_id bigint primary key references public.item_sizes on delete cascade,
  default_rate numeric(10, 2) not null default 0
);

create table public.customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  city text,
  created_at timestamptz not null default now()
);

create table public.customer_rates (
  customer_id bigint not null references public.customers on delete cascade,
  item_size_id bigint not null references public.item_sizes on delete cascade,
  rate numeric(10, 2) not null,
  primary key (customer_id, item_size_id)
);

-- ───────────────────────── Orders ─────────────────────────
create sequence public.order_no_seq start 1001;

create table public.orders (
  id bigint generated always as identity primary key,
  order_no bigint not null unique default nextval('public.order_no_seq'),
  order_date date not null default (now() at time zone 'Asia/Kolkata')::date,
  customer_id bigint not null references public.customers on delete restrict,
  customer_name text not null,
  phone text,
  album_name text,
  notes text,
  status text not null default 'new' check (status in ('new', 'printing', 'ready', 'delivered')),
  created_by uuid default auth.uid() references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create index orders_date_idx on public.orders (order_date);
create index orders_customer_idx on public.orders (customer_id);

create table public.order_lines (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders on delete cascade,
  item_id bigint references public.items on delete set null,
  item_size_id bigint references public.item_sizes on delete set null,
  item_name text not null,
  category text not null,
  size text,
  qty int not null check (qty > 0),
  sort int not null default 0
);
create index order_lines_order_idx on public.order_lines (order_id);

create table public.order_line_amounts (
  line_id bigint primary key references public.order_lines on delete cascade,
  rate numeric(10, 2) not null,
  amount numeric(12, 2) not null
);

create table public.order_amounts (
  order_id bigint primary key references public.orders on delete cascade,
  total numeric(12, 2) not null default 0,
  advance numeric(12, 2) not null default 0
);

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_sizes enable row level security;
alter table public.item_size_prices enable row level security;
alter table public.customers enable row level security;
alter table public.customer_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_lines enable row level security;
alter table public.order_line_amounts enable row level security;
alter table public.order_amounts enable row level security;

create policy "own profile or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "signed-in can read items" on public.items
  for select to authenticated using (true);
create policy "admin manages items" on public.items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "signed-in can read sizes" on public.item_sizes
  for select to authenticated using (true);
create policy "admin manages sizes" on public.item_sizes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin only" on public.item_size_prices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "signed-in can read customers" on public.customers
  for select to authenticated using (true);
create policy "signed-in can add customers" on public.customers
  for insert to authenticated with check (true);
create policy "admin updates customers" on public.customers
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes customers" on public.customers
  for delete to authenticated using (public.is_admin());

create policy "admin only" on public.customer_rates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "signed-in can read orders" on public.orders
  for select to authenticated using (true);
create policy "admin updates orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes orders" on public.orders
  for delete to authenticated using (public.is_admin());

create policy "signed-in can read order lines" on public.order_lines
  for select to authenticated using (true);

create policy "admin only" on public.order_line_amounts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.order_amounts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Create order (staff + admin) ─────────────────────────
-- Runs with elevated rights so it can price the order from the customer's rate list,
-- while the caller never gets to read those rates.
create function public.create_order(
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
  if auth.uid() is null then
    raise exception 'Please sign in again';
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

-- ───────────────────────── Admin: users & passwords ─────────────────────────
create function public.admin_list_users()
returns table (id uuid, username text, role text, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can do this';
  end if;
  return query
    select p.id, p.username, p.role, u.last_sign_in_at
    from public.profiles p join auth.users u on u.id = p.id
    order by p.role, p.username;
end $$;

create function public.admin_set_password(p_user_id uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can do this';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = p_user_id;
end $$;

revoke execute on function public.create_order(bigint, text, text, text, date, jsonb) from public, anon;
revoke execute on function public.admin_list_users() from public, anon;
revoke execute on function public.admin_set_password(uuid, text) from public, anon;
grant execute on function public.create_order(bigint, text, text, text, date, jsonb) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;

-- ───────────────────────── Default price list ─────────────────────────
-- Rate card prices are loaded as the 12x36 size; add other sizes and their prices in the admin panel.
with seed(name, category, sort, rate) as (
  values
    ('NTR Sheet', 'sheet', 1, 35),
    ('High Glossy', 'sheet', 2, 25),
    ('Cover Normal', 'cover', 10, 300),
    ('Cover 3D', 'cover', 11, 300),
    ('Cover Sparkal', 'cover', 12, 300),
    ('2 Piece Box', 'box', 20, 1100),
    ('3 Piece Box', 'box', 21, 1300),
    ('5 in 1 Combo', 'product', 30, 2500),
    ('Piano Combo', 'product', 31, 3200)
),
ins as (
  insert into public.items (name, category, sort)
  select name, category, sort from seed
  returning id, name
),
sized as (
  insert into public.item_sizes (item_id, size, sort)
  select id, '12x36', 1 from ins
  returning id, item_id
)
insert into public.item_size_prices (item_size_id, default_rate)
select sized.id, seed.rate
from sized join ins on ins.id = sized.item_id join seed on seed.name = ins.name;

insert into public.customers (name) values
  ('customer1'), ('customer2'), ('customer3'), ('customer4'), ('customer5');
