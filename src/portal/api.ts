import { supabase } from './supabase'
import { CATEGORY_ORDER, type Customer, type FullOrder, type Item, type ItemSize, type Order, type OrderLine } from './types'

export async function listItems(includeInactive = false) {
  let query = supabase
    .from('items')
    .select('id, name, category, sort, active, finishes, quota_exempt_for')
    .order('sort')
    .order('name')
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Item[]
}

export async function listCustomers() {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return (data ?? []) as Customer[]
}

export async function listItemSizes(includeInactive = false) {
  let query = supabase.from('item_sizes').select('id, item_id, size, sort, active').order('sort').order('size')
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ItemSize[]
}

/** Map key for a size + finish rate. Finish is '' when the item has no Gloss/Matt choice. */
export function rateKey(itemSizeId: number, finish = '') {
  return `${itemSizeId}::${finish || ''}`
}

/** Sheet sizes that always bill at the same rate as 12x36 (display / print only). */
export const RATE_ALIAS_OF_12x36 = new Set(['12x30', '12x24'])

export function isRateAliasOf12x36(size: string) {
  return RATE_ALIAS_OF_12x36.has(size)
}

/** Default rate per item size (+ finish). Admin only — RLS returns nothing for staff. */
export async function listDefaultRates() {
  const { data, error } = await supabase.from('item_size_prices').select('item_size_id, finish, default_rate')
  if (error) throw error
  return new Map(
    (data ?? []).map((r) => [rateKey(r.item_size_id as number, (r.finish as string) ?? ''), Number(r.default_rate)]),
  )
}

type OrderRow = Order & {
  order_lines: (OrderLine & { order_line_amounts?: { rate: number; amount: number } | null })[]
  order_amounts?: { total: number; advance: number } | null
  customers?: { two_bill_prints: boolean } | null
}

function toFullOrder(row: OrderRow, withPrices: boolean): FullOrder {
  const { order_lines, order_amounts, customers, ...order } = row
  const lines = [...(order_lines ?? [])]
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.sort - b.sort,
    )
    .map(({ order_line_amounts, ...line }) =>
      withPrices
        ? { ...line, rate: Number(order_line_amounts?.rate ?? 0), amount: Number(order_line_amounts?.amount ?? 0) }
        : line,
    )
  const two_bill_prints = Boolean(customers?.two_bill_prints)
  return withPrices
    ? { ...order, lines, total: Number(order_amounts?.total ?? 0), advance: Number(order_amounts?.advance ?? 0), two_bill_prints }
    : { ...order, lines, two_bill_prints }
}

function orderSelect(withPrices: boolean) {
  return withPrices
    ? '*, customers(two_bill_prints), order_lines(*, order_line_amounts(rate, amount)), order_amounts(total, advance)'
    : '*, customers(two_bill_prints), order_lines(*)'
}

export async function loadOrdersBetween(from: string, to: string, withPrices: boolean) {
  const { data, error } = await supabase
    .from('orders')
    .select(orderSelect(withPrices))
    .gte('order_date', from)
    .lte('order_date', to)
    .order('order_no', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as OrderRow[]).map((r) => toFullOrder(r, withPrices))
}

export async function loadOrder(orderNo: number, withPrices: boolean) {
  const { data, error } = await supabase.from('orders').select(orderSelect(withPrices)).eq('order_no', orderNo).maybeSingle()
  if (error) throw error
  return data ? toFullOrder(data as unknown as OrderRow, withPrices) : null
}

export async function loadCustomerOrders(customerId: number, limit = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select(orderSelect(true))
    .eq('customer_id', customerId)
    .order('order_no', { ascending: false })
    .limit(limit)
  if (error) throw error
  return ((data ?? []) as unknown as OrderRow[]).map((r) => toFullOrder(r, true))
}

/** Plain name, or "Normal High · Gloss" when a finish is shown. */
export function itemLabel(item: Pick<Item, 'name' | 'finishes'>, finish?: string | null) {
  if (finish) return `${item.name} · ${finish}`
  return item.finishes?.length ? `${item.name} (Gloss / Matt)` : item.name
}

/** Deletes the order and every related line / amount from the database. Staff and admin. */
export async function deleteOrder(orderNo: number) {
  const { error } = await supabase.rpc('delete_order', { p_order_no: orderNo })
  if (error) throw error
}

/** Album + loose sheets, excluding Crystal / Emboss lines billed outside the sheet total. */
export function totalSheets(order: Pick<FullOrder, 'lines'>) {
  return order.lines
    .filter((l) => (l.category === 'sheet' || l.category === 'loose') && l.counts_in_total !== false)
    .reduce((sum, l) => sum + l.qty, 0)
}

export function lineLabel(line: Pick<OrderLine, 'item_name' | 'size' | 'qty'>) {
  return `${line.item_name}${line.size ? ` ${line.size}` : ''} × ${line.qty}`
}
