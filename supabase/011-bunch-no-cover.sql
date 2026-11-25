-- Rainbow Colour Lab · Album Desk · 011
-- Auto-add "Bunch" at ₹50 when an album has no cover.
-- Hidden from the new-order picker; still editable on Customers → Default price list.
-- Run once in Supabase → SQL Editor, after 010. Keeps all existing data.

begin;

-- Allow bunch as an item category
alter table public.items drop constraint if exists items_category_check;
alter table public.items
  add constraint items_category_check
  check (category in ('sheet', 'cover', 'box', 'product', 'bunch'));

-- Seed Bunch · default ₹50 for everyone
with ins as (
  insert into public.items (name, category, sort, active)
  select 'Bunch', 'bunch', 90, true
  where not exists (select 1 from public.items where category = 'bunch' and name = 'Bunch')
  returning id
),
sized as (
  insert into public.item_sizes (item_id, size, sort, active)
  select id, '', 1, true from ins
  returning id
)
insert into public.item_size_prices (item_size_id, finish, default_rate)
select id, '', 50 from sized
on conflict (item_size_id, finish) do update set default_rate = excluded.default_rate;

-- If Bunch already existed from a partial run, ensure price is set
insert into public.item_size_prices (item_size_id, finish, default_rate)
select s.id, '', 50
from public.items i
join public.item_sizes s on s.item_id = i.id
where i.category = 'bunch' and i.name = 'Bunch'
on conflict (item_size_id, finish) do nothing;

-- create_order: after lines, if no cover → add Bunch (rate from price list, fallback ₹50)
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
  v_has_cover boolean := false;
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

    -- Staff never pick Bunch; it is auto-added when there is no cover
    continue when v_item.category = 'bunch';

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

    if v_item.category = 'cover' then
      v_has_cover := true;
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

  -- No cover → add Bunch (₹50 by default)
  if not v_has_cover then
    select * into v_item from items where category = 'bunch' and name = 'Bunch' and active limit 1;
    if found then
      select * into v_size from item_sizes where item_id = v_item.id and active order by sort limit 1;
      if found then
        v_rate := coalesce(
          (select rate from customer_rates
            where customer_id = v_cust.id and item_size_id = v_size.id and finish = ''),
          (select default_rate from item_size_prices
            where item_size_id = v_size.id and finish = ''),
          50
        );
        v_sort := v_sort + 1;
        insert into order_lines (order_no, item_id, item_size_id, item_name, finish, category, size, qty, sort)
        values (v_order_no, v_item.id, v_size.id, v_item.name, null, 'bunch', v_size.size, 1, v_sort)
        returning id into v_line_id;
        insert into order_line_amounts (line_id, rate, amount)
        values (v_line_id, v_rate, v_rate);
        v_total := v_total + v_rate;
      end if;
    end if;
  end if;

  insert into order_amounts (order_no, total, advance) values (v_order_no, v_total, 0);

  return jsonb_build_object('order_no', v_order_no);
end $$;

-- Backfill: existing albums with no cover and no Bunch line yet
with bunch as (
  select i.id as item_id, s.id as size_id, coalesce(p.default_rate, 50) as rate
  from public.items i
  join public.item_sizes s on s.item_id = i.id
  left join public.item_size_prices p on p.item_size_id = s.id and p.finish = ''
  where i.category = 'bunch' and i.name = 'Bunch'
  order by s.sort
  limit 1
),
targets as (
  select o.order_no, b.item_id, b.size_id,
    coalesce(
      (select r.rate from public.customer_rates r
        where r.customer_id = o.customer_id and r.item_size_id = b.size_id and r.finish = ''),
      b.rate
    ) as rate,
    coalesce((select max(ol.sort) from public.order_lines ol where ol.order_no = o.order_no), 0) + 1 as sort
  from public.orders o
  cross join bunch b
  where not exists (
    select 1 from public.order_lines ol where ol.order_no = o.order_no and ol.category = 'cover'
  )
  and not exists (
    select 1 from public.order_lines ol where ol.order_no = o.order_no and ol.category = 'bunch'
  )
),
ins_lines as (
  insert into public.order_lines (order_no, item_id, item_size_id, item_name, finish, category, size, qty, sort)
  select t.order_no, t.item_id, t.size_id, 'Bunch', null, 'bunch', '', 1, t.sort
  from targets t
  returning id, order_no
)
insert into public.order_line_amounts (line_id, rate, amount)
select il.id, t.rate, t.rate
from ins_lines il
join targets t on t.order_no = il.order_no;

-- Recompute totals for orders that now include Bunch
update public.order_amounts a
set total = s.sum_amt
from (
  select ol.order_no, sum(ola.amount) as sum_amt
  from public.order_lines ol
  join public.order_line_amounts ola on ola.line_id = ol.id
  group by ol.order_no
) s
where a.order_no = s.order_no
  and exists (
    select 1 from public.order_lines ol
    where ol.order_no = a.order_no and ol.category = 'bunch'
  );

commit;

notify pgrst, 'reload schema';
