-- Rainbow Colour Lab · Album Desk · 016
-- 1. Crystal (collection + counter) and Emboss Sheet (counter) do not count toward the album's sheet total.
-- 2. 5 in 1 combo and Piano Combo move from products to "Box & combos".
-- 3. Cover XOR box/combo; other products are a separate, independent section.
-- 4. New product: QR Code at ₹50.
-- 5. Crystal size label 12x36 → 12x18 (same size row, so every customer keeps their rate).
-- 6. Loose sheets: same items as sheets, saved as category 'loose'; they never trigger Bunch.
-- Run once in Supabase → SQL Editor, after 015.

begin;

-- ── Items that are billed but not counted in the album sheet total ──
alter table public.items
  add column if not exists quota_exempt_for text[];

comment on column public.items.quota_exempt_for is
  'Customer types (collection / counter) for which this sheet is billed separately and not counted in the album sheet total.';

update public.items set quota_exempt_for = array['collection', 'counter']
where category = 'sheet' and name = 'Crystal';

update public.items set quota_exempt_for = array['counter']
where category = 'sheet' and name = 'Emboss Sheet';

-- ── Order lines remember whether they count toward the sheet total ──
alter table public.order_lines
  add column if not exists counts_in_total boolean not null default true;

-- ── Combos join boxes ──
update public.items set category = 'box', sort = 40
where name = '5 in 1 combo(table calendar, mini book, 2 keyring)';

update public.items set category = 'box', sort = 41
where name = 'Piano Combo (table calendar, mini book, 2 keyring)';

update public.order_lines set category = 'box'
where category = 'product'
  and item_name in (
    '5 in 1 combo(table calendar, mini book, 2 keyring)',
    'Piano Combo (table calendar, mini book, 2 keyring)'
  );

-- ── QR Code · ₹50 for everyone ──
with ins as (
  insert into public.items (name, category, sort, active)
  select 'QR Code', 'product', 50, true
  where not exists (select 1 from public.items where category = 'product' and name = 'QR Code')
  returning id
),
sized as (
  insert into public.item_sizes (item_id, size, sort, active)
  select id, '', 1, true from ins
  returning id
)
insert into public.item_size_prices (item_size_id, finish, default_rate)
select id, '', 50 from sized
on conflict (item_size_id, finish) do nothing;

-- ── Crystal 12x36 → 12x18 (same row id, so customer rates stay attached) ──
update public.item_sizes s
set size = '12x18'
from public.items i
where i.id = s.item_id
  and i.category = 'sheet'
  and i.name = 'Crystal'
  and s.size = '12x36'
  and not exists (
    select 1 from public.item_sizes x where x.item_id = s.item_id and x.size = '12x18'
  );

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

    v_rate := coalesce(
      (select rate from customer_rates
        where customer_id = v_cust.id and item_size_id = v_rate_size_id and finish = v_finish_key),
      (select default_rate from item_size_prices
        where item_size_id = v_rate_size_id and finish = v_finish_key),
      0
    );

    v_sort := v_sort + 1;
    insert into order_lines (order_no, item_id, item_size_id, item_name, finish, category, size, qty, sort, counts_in_total)
    values (
      v_order_no, v_item.id, v_size.id,
      case when v_finish is null then v_item.name else v_item.name || ' ' || v_finish end,
      v_finish, v_line_category, v_size.size, v_qty, v_sort, v_counts
    )
    returning id into v_line_id;

    insert into order_line_amounts (line_id, rate, amount)
    values (v_line_id, v_rate, v_rate * v_qty);

    v_total := v_total + v_rate * v_qty;
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
