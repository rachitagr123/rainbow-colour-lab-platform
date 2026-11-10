-- Rainbow Colour Lab · Album Desk · 004: customer type (collection / counter).
-- Run once in Supabase → SQL Editor, after 003-one-cover-box.sql. Keeps all existing data;
-- existing customers and orders become "collection".

alter table public.customers
  add column if not exists customer_type text not null default 'collection'
  check (customer_type in ('collection', 'counter'));

-- Copied onto each order so old slips keep their heading if the customer's type changes later.
alter table public.orders
  add column if not exists customer_type text not null default 'collection'
  check (customer_type in ('collection', 'counter'));

create or replace function public.set_order_customer_type() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select customer_type into new.customer_type from customers where id = new.customer_id;
  return new;
end $$;

drop trigger if exists orders_set_customer_type on public.orders;
create trigger orders_set_customer_type
  before insert on public.orders
  for each row execute function public.set_order_customer_type();
