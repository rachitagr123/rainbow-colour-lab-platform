-- Rainbow Colour Lab · Album Desk · 009
-- Add Minibook (6x9, ₹250) and Keyring (no size, ₹250) under Combos & other products.
-- Run once in Supabase → SQL Editor, after 008. Keeps all existing data.
-- Customer-specific rates can be set later in the admin Customers screen.

begin;

-- Minibook · always 6x9
with ins as (
  insert into public.items (name, category, sort, active)
  select 'Minibook', 'product', 40, true
  where not exists (select 1 from public.items where name = 'Minibook')
  returning id
),
sized as (
  insert into public.item_sizes (item_id, size, sort, active)
  select id, '6x9', 1, true from ins
  returning id
)
insert into public.item_size_prices (item_size_id, default_rate)
select id, 250 from sized
on conflict (item_size_id) do update set default_rate = excluded.default_rate;

-- Keyring · no size (blank size label; slip shows —)
with ins as (
  insert into public.items (name, category, sort, active)
  select 'Keyring', 'product', 41, true
  where not exists (select 1 from public.items where name = 'Keyring')
  returning id
),
sized as (
  insert into public.item_sizes (item_id, size, sort, active)
  select id, '', 1, true from ins
  returning id
)
insert into public.item_size_prices (item_size_id, default_rate)
select id, 250 from sized
on conflict (item_size_id) do update set default_rate = excluded.default_rate;

commit;

notify pgrst, 'reload schema';
