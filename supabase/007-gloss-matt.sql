-- Rainbow Colour Lab · Album Desk · 007: Gloss / Matt choice for Normal High, NTR Slim, NTR Heavy.
-- Run once in Supabase → SQL Editor, after 006. Keeps all existing data.
--
-- Gloss and Matt share one item, so prices and every customer's special rates stay as they are.
-- The order line remembers the chosen finish and its name becomes e.g. "Normal High Gloss".

begin;

alter table public.items add column if not exists finishes text[];
alter table public.order_lines add column if not exists finish text;

update public.items set name = 'Normal High', finishes = array['Gloss', 'Matt'] where name = 'Normal High (Gloss/Matt)';
update public.items set name = 'NTR Slim', finishes = array['Gloss', 'Matt'] where name = 'NTR Slim (Gloss/Matt)';
update public.items set name = 'NTR Heavy', finishes = array['Gloss', 'Matt'] where name = 'NTR Heavy (Gloss/Matt)';

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
  v_finish text;
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

    v_finish := null;
    if coalesce(array_length(v_item.finishes, 1), 0) > 0 then
      v_finish := nullif(trim(coalesce(v_line ->> 'finish', '')), '');
      if v_finish is null or not (v_finish = any (v_item.finishes)) then
        raise exception 'Choose % for %', array_to_string(v_item.finishes, ' or '), v_item.name;
      end if;
    end if;

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
    insert into order_lines (order_no, item_id, item_size_id, item_name, finish, category, size, qty, sort)
    values (
      v_order_no, v_item.id, v_size.id,
      case when v_finish is null then v_item.name else v_item.name || ' ' || v_finish end,
      v_finish, v_item.category, v_size.size, v_qty, v_sort
    )
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

notify pgrst, 'reload schema';
