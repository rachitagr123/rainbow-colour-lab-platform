-- Rainbow Colour Lab · Album Desk · 006: total amount for the customer's WhatsApp message.
-- Run once in Supabase → SQL Editor, after 005-order-no-key.sql. Keeps all existing data.
--
-- Staff still cannot read rates, line amounts or the order_amounts table. This returns only
-- the single total of one order, so it can go into the WhatsApp message.

create or replace function public.order_total(p_order_no bigint) returns numeric
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'Your account is waiting for admin approval';
  end if;
  return (select total from order_amounts where order_no = p_order_no);
end $$;

revoke execute on function public.order_total(bigint) from public, anon;
grant execute on function public.order_total(bigint) to authenticated;
