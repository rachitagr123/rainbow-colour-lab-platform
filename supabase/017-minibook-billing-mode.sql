-- Rainbow Colour Lab · Album Desk · 017
-- Minibook (and any item with allows_fixed_billing): customer rate can be
--   per_unit  → amount = rate × qty  (default, current behaviour)
--   fixed     → amount = rate        (flat total, qty still stored for production)
-- Run once in Supabase → SQL Editor after 016.

begin;

alter table public.items
  add column if not exists allows_fixed_billing boolean not null default false;

update public.items
set allows_fixed_billing = true
where name = 'Minibook';

alter table public.customer_rates
  add column if not exists billing text not null default 'per_unit';

alter table public.customer_rates
  drop constraint if exists customer_rates_billing_check;

alter table public.customer_rates
  add constraint customer_rates_billing_check
  check (billing in ('per_unit', 'fixed'));

-- ── create_order ──
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
  v_billing text;
  v_amount numeric;
  v_total numeric := 0;
  v_sort int := 0;
  v_finish text;
  v_finish_key text;
  v_pack text := null;
  v_loose boolean;
  v_line_category text;
  v_counts boolean;
  v_has_album_sheets boolean := false;
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

    continue when v_item.category = 'bunch';

    v_finish := null;
    if coalesce(array_length(v_item.finishes, 1), 0) > 0 then
      v_finish := nullif(trim(coalesce(v_line ->> 'finish', '')), '');
      if v_finish is null or not (v_finish = any (v_item.finishes)) then
        raise exception 'Choose % for %', array_to_string(v_item.finishes, ' or '), v_item.name;
      end if;
    end if;
    v_finish_key := coalesce(v_finish, '');

    -- Cover and box/combo are mutually exclusive, one each, qty 1. Other products are free.
    if v_item.category in ('cover', 'box') then
      if v_pack is not null and v_pack <> v_item.category then
        raise exception 'An album can have either a cover or a box/combo, not both';
      end if;
      if v_pack = v_item.category then
        raise exception 'An album can have only one %', case when v_item.category = 'box' then 'box or combo' else 'cover' end;
      end if;
      v_pack := v_item.category;
      v_qty := 1;
    end if;

    v_loose := v_item.category = 'sheet' and coalesce((v_line ->> 'loose')::boolean, false);
    v_line_category := case when v_loose then 'loose' else v_item.category end;
    v_counts := not (
      v_item.category = 'sheet'
      and v_cust.customer_type = any (coalesce(v_item.quota_exempt_for, array[]::text[]))
    );

    if v_item.category = 'sheet' and not v_loose then
      v_has_album_sheets := true;
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

    select r.rate, r.billing into v_rate, v_billing
    from customer_rates r
    where r.customer_id = v_cust.id and r.item_size_id = v_rate_size_id and r.finish = v_finish_key;

    if not found then
      v_rate := coalesce(
        (select default_rate from item_size_prices
          where item_size_id = v_rate_size_id and finish = v_finish_key),
        0
      );
      v_billing := 'per_unit';
    end if;

    -- Fixed total only applies when the item allows it (Minibook today)
    if v_billing = 'fixed' and v_item.allows_fixed_billing then
      v_amount := v_rate;
    else
      v_amount := v_rate * v_qty;
    end if;

    v_sort := v_sort + 1;
    insert into order_lines (order_no, item_id, item_size_id, item_name, finish, category, size, qty, sort, counts_in_total)
    values (
      v_order_no, v_item.id, v_size.id,
      case when v_finish is null then v_item.name else v_item.name || ' ' || v_finish end,
      v_finish, v_line_category, v_size.size, v_qty, v_sort, v_counts
    )
    returning id into v_line_id;

    insert into order_line_amounts (line_id, rate, amount)
    values (v_line_id, v_rate, v_amount);

    v_total := v_total + v_amount;
  end loop;

  if v_sort = 0 then
    raise exception 'Add at least one item with a quantity';
  end if;

  -- Bunch: album sheets (not loose) with no cover and no box/combo
  if v_has_album_sheets and v_pack is null then
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
