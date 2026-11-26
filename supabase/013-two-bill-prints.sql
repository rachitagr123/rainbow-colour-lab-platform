-- Rainbow Colour Lab · Album Desk · 013
-- Per-customer flag: print 2 priced bill slips on day print (default = 1).
-- Run once in Supabase → SQL Editor, after 012.

begin;

alter table public.customers
  add column if not exists two_bill_prints boolean not null default false;

comment on column public.customers.two_bill_prints is
  'When true, end-of-day admin print produces 2 bill copies for this customer’s albums; otherwise 1.';

commit;

notify pgrst, 'reload schema';
