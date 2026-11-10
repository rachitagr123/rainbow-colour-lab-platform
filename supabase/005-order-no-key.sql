-- Rainbow Colour Lab · Album Desk · 005: the order number is the key of every order table.
-- Run once in Supabase → SQL Editor, after 004-customer-type.sql. Existing orders are converted.
--
--   orders.order_no             primary key (the old internal "id" column is removed)
--   order_lines.order_no        → orders.order_no
--   order_amounts.order_no      primary key, → orders.order_no
--
-- Runs as one transaction: if any step fails, nothing is changed.

begin;

-- 1. Copy the order number into the child tables.
alter table public.order_lines add column if not exists order_no bigint;
update public.order_lines l set order_no = o.order_no from public.orders o where o.id = l.order_id;

alter table public.order_amounts add column if not exists order_no bigint;
update public.order_amounts a set order_no = o.order_no from public.orders o where o.id = a.order_id;

-- 2. Drop the old internal id links.
alter table public.order_lines drop column order_id;
alter table public.order_amounts drop column order_id;
alter table public.orders drop column id;

-- 3. Order number becomes the primary key everywhere.
alter table public.orders drop constraint if exists orders_order_no_key;
alter table public.orders add primary key (order_no);

alter table public.order_lines alter column order_no set not null;
alter table public.order_lines
  add constraint order_lines_order_no_fkey foreign key (order_no)
  references public.orders (order_no) on delete cascade on update cascade;
create index if not exists order_lines_order_no_idx on public.order_lines (order_no);

alter table public.order_amounts alter column order_no set not null;
alter table public.order_amounts add primary key (order_no);
alter table public.order_amounts
  add constraint order_amounts_order_no_fkey foreign key (order_no)
  references public.orders (order_no) on delete cascade on update cascade;

-- 4. Save orders by order number.
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
  v_order_no bigint;
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
  returning order_no into v_order_no;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop
    v_qty := nullif(v_line ->> 'qty', '')::int;
    continue when v_qty is null or v_qty <= 0;

    select * into v_size from item_sizes where id = (v_line ->> 'item_size_id')::bigint;
    if not found then
      raise exception 'Unknown item size in order';
    end if;
    select * into v_item from items where id = v_size.item_id;

    if v_item.category in ('cover', 'box') then
      v_qty := 1;
      if exists (select 1 from order_lines where order_no = v_order_no and category = v_item.category) then
        raise exception 'An album can have only one %', v_item.category;
      end if;
    end if;

    v_rate := coalesce(
      (select rate from customer_rates where customer_id = v_cust.id and item_size_id = v_size.id),
      (select default_rate from item_size_prices where item_size_id = v_size.id),
      0
    );

    v_sort := v_sort + 1;
    insert into order_lines (order_no, item_id, item_size_id, item_name, category, size, qty, sort)
    values (v_order_no, v_item.id, v_size.id, v_item.name, v_item.category, v_size.size, v_qty, v_sort)
    returning id into v_line_id;

    insert into order_line_amounts (line_id, rate, amount)
    values (v_line_id, v_rate, v_rate * v_qty);

    v_total := v_total + v_rate * v_qty;
  end loop;

  if v_sort = 0 then
    raise exception 'Add at least one item with a quantity';
  end if;

  insert into order_amounts (order_no, total, advance) values (v_order_no, v_total, 0);

  return jsonb_build_object('order_no', v_order_no);
end $$;

commit;

-- Ask the API to pick up the new table links straight away.
notify pgrst, 'reload schema';
