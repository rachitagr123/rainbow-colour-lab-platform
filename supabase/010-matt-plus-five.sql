-- Rainbow Colour Lab · Album Desk · 010
-- Gloss and Matt get separate prices. Existing Gloss keeps current rate; Matt = Gloss + ₹5.
-- Applies to default price list and every customer special rate.
-- Run once in Supabase → SQL Editor, after 009. Keeps all existing data.

begin;

-- ── Price rows keyed by (item_size_id, finish) ──
alter table public.item_size_prices
  add column if not exists finish text not null default '';

alter table public.customer_rates
  add column if not exists finish text not null default '';

-- Drop old single-size PKs so Gloss + Matt rows can coexist
alter table public.item_size_prices drop constraint if exists item_size_prices_pkey;
alter table public.customer_rates drop constraint if exists customer_rates_pkey;

-- Existing shared rates become Gloss for finish items
update public.item_size_prices p
set finish = 'Gloss'
from public.item_sizes s
join public.items i on i.id = s.item_id
where p.item_size_id = s.id
  and coalesce(array_length(i.finishes, 1), 0) > 0
  and p.finish = '';

update public.customer_rates r
set finish = 'Gloss'
from public.item_sizes s
join public.items i on i.id = s.item_id
where r.item_size_id = s.id
  and coalesce(array_length(i.finishes, 1), 0) > 0
  and r.finish = '';

-- Matt rows = Gloss + 5 (defaults)
insert into public.item_size_prices (item_size_id, finish, default_rate)
select p.item_size_id, 'Matt', p.default_rate + 5
from public.item_size_prices p
join public.item_sizes s on s.id = p.item_size_id
join public.items i on i.id = s.item_id
where p.finish = 'Gloss'
  and 'Matt' = any (i.finishes)
  and not exists (
    select 1 from public.item_size_prices x
    where x.item_size_id = p.item_size_id and x.finish = 'Matt'
  );

-- Matt rows = Gloss + 5 (customer specials)
insert into public.customer_rates (customer_id, item_size_id, finish, rate)
select r.customer_id, r.item_size_id, 'Matt', r.rate + 5
from public.customer_rates r
join public.item_sizes s on s.id = r.item_size_id
join public.items i on i.id = s.item_id
where r.finish = 'Gloss'
  and 'Matt' = any (i.finishes)
  and not exists (
    select 1 from public.customer_rates x
    where x.customer_id = r.customer_id
      and x.item_size_id = r.item_size_id
      and x.finish = 'Matt'
  );

-- Composite PKs: size + finish
alter table public.item_size_prices
  add constraint item_size_prices_pkey primary key (item_size_id, finish);

alter table public.customer_rates
  add constraint customer_rates_pkey primary key (customer_id, item_size_id, finish);

-- Price by finish when creating an order
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
  v_finish_key text;
  v_pack text := null;
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
    v_finish_key := coalesce(v_finish, '');

    if v_item.category in ('cover', 'box', 'product') then
      if v_pack is not null and v_pack <> v_item.category then
        raise exception 'An album can have only one of cover, box or combo';
      end if;
      v_pack := v_item.category;
    end if;

    if v_item.category in ('cover', 'box', 'product') then
      v_qty := 1;
      if v_item.category in ('cover', 'box')
         and exists (select 1 from order_lines where order_no = v_order_no and category = v_item.category) then
        raise exception 'An album can have only one %', v_item.category;
      end if;
      if v_item.category = 'product'
         and exists (select 1 from order_lines where order_no = v_order_no and category = 'product') then
        raise exception 'An album can have only one combo or product';
      end if;
    end if;

    v_rate := coalesce(
      (select rate from customer_rates
        where customer_id = v_cust.id and item_size_id = v_size.id and finish = v_finish_key),
      (select default_rate from item_size_prices
        where item_size_id = v_size.id and finish = v_finish_key),
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
