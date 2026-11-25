-- Rainbow Colour Lab · Album Desk · 012
-- Add 12x30 and 12x24 for selected sheet types. They always bill at the 12x36 rate
-- (same Gloss / Matt) for that sheet — display / print sizes only.
-- Run once in Supabase → SQL Editor, after 011.

begin;

-- Sheets that get the two new sizes (inline — no temp table / no RLS prompt)
-- Insert missing 12x30 / 12x24 (idempotent)
insert into public.item_sizes (item_id, size, sort, active)
select
  i.id,
  a.size,
  coalesce((select max(s.sort) from public.item_sizes s where s.item_id = i.id), 0)
    + case when a.size = '12x30' then 1 else 2 end,
  true
from public.items i
cross join (values ('12x30'), ('12x24')) as a(size)
where i.category = 'sheet'
  and i.name in (
    'Normal High',
    'NTR Slim',
    'NTR Heavy',
    'NTR Silky Matt',
    'Normal Velvet',
    'NTR Velvet'
  )
  and not exists (
    select 1 from public.item_sizes x
    where x.item_id = i.id and x.size = a.size
  );

-- Copy default prices from 12x36 (all finishes) onto the alias sizes
insert into public.item_size_prices (item_size_id, finish, default_rate)
select alias.id, p.finish, p.default_rate
from public.item_sizes alias
join public.items i on i.id = alias.item_id
join public.item_sizes base
  on base.item_id = alias.item_id and base.size = '12x36'
join public.item_size_prices p on p.item_size_id = base.id
where i.category = 'sheet'
  and i.name in (
    'Normal High',
    'NTR Slim',
    'NTR Heavy',
    'NTR Silky Matt',
    'Normal Velvet',
    'NTR Velvet'
  )
  and alias.size in ('12x30', '12x24')
on conflict (item_size_id, finish) do update
  set default_rate = excluded.default_rate;

-- Copy customer specials from 12x36 onto alias sizes
insert into public.customer_rates (customer_id, item_size_id, finish, rate)
select r.customer_id, alias.id, r.finish, r.rate
from public.customer_rates r
join public.item_sizes base on base.id = r.item_size_id and base.size = '12x36'
join public.items i on i.id = base.item_id
join public.item_sizes alias
  on alias.item_id = base.item_id and alias.size in ('12x30', '12x24')
where i.category = 'sheet'
  and i.name in (
    'Normal High',
    'NTR Slim',
    'NTR Heavy',
    'NTR Silky Matt',
    'Normal Velvet',
    'NTR Velvet'
  )
on conflict (customer_id, item_size_id, finish) do update
  set rate = excluded.rate;

-- create_order: 12x30 / 12x24 always use the 12x36 rate for that item + finish
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
  v_rate_size_id bigint;
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

    -- Display sizes 12x30 / 12x24 always charge the 12x36 rate
    v_rate_size_id := v_size.id;
    if v_size.size in ('12x30', '12x24') then
      select s.id into v_rate_size_id
      from item_sizes s
      where s.item_id = v_size.item_id and s.size = '12x36'
      limit 1;
      if v_rate_size_id is null then
        v_rate_size_id := v_size.id;
      end if;
    end if;

    v_rate := coalesce(
      (select rate from customer_rates
        where customer_id = v_cust.id and item_size_id = v_rate_size_id and finish = v_finish_key),
      (select default_rate from item_size_prices
        where item_size_id = v_rate_size_id and finish = v_finish_key),
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

commit;

notify pgrst, 'reload schema';
