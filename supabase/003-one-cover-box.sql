-- Rainbow Colour Lab · Album Desk · 003: an album has at most one cover and one box, each quantity 1.
-- Run once in Supabase → SQL Editor, after 002-staff-signup.sql. Keeps all existing data.

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

    if v_item.category in ('cover', 'box') then
      v_qty := 1;
      if exists (select 1 from order_lines where order_id = v_order.id and category = v_item.category) then
        raise exception 'An album can have only one %', v_item.category;
      end if;
    end if;

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
