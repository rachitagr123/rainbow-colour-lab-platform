export type Role = 'admin' | 'manager' | 'staff'

/** 'loose' exists only on order lines: a sheet item entered in the Loose sheets section. */
export type Category = 'sheet' | 'loose' | 'cover' | 'box' | 'product' | 'bunch'

export const CATEGORY_LABEL: Record<Category, string> = {
  sheet: 'Sheets',
  loose: 'Loose sheets',
  cover: 'Cover',
  box: 'Box & combos',
  product: 'Other products',
  bunch: 'Bunch',
}

export const CATEGORY_ORDER: Category[] = ['sheet', 'loose', 'cover', 'box', 'product', 'bunch']

/** Categories an item itself can belong to (no 'loose'). */
export const ITEM_CATEGORIES: Category[] = ['sheet', 'cover', 'box', 'product', 'bunch']

export type OrderStatus = 'new' | 'printing' | 'ready' | 'delivered'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  printing: 'In print',
  ready: 'Ready',
  delivered: 'Delivered',
}

export interface Profile {
  id: string
  username: string
  role: Role
  approved: boolean
  full_name: string | null
}

/** How a customer rate is billed. Fixed total is only offered for items with allows_fixed_billing (Minibook). */
export type RateBilling = 'per_unit' | 'fixed'

export const RATE_BILLING_LABEL: Record<RateBilling, string> = {
  per_unit: 'Per sheet',
  fixed: 'Fixed total',
}

export interface Item {
  id: number
  name: string
  category: Category
  sort: number
  active: boolean
  /** e.g. ['Gloss', 'Matt']: chosen per order line; Matt defaults to Gloss + ₹5. */
  finishes: string[] | null
  /** Customer types for which this sheet is billed separately and not counted in the sheet total. */
  quota_exempt_for: CustomerType[] | null
  /** When true, customer rate can be per-sheet or a fixed total (Minibook). */
  allows_fixed_billing: boolean
}

export interface ItemSize {
  id: number
  item_id: number
  size: string
  sort: number
  active: boolean
}

export type CustomerType = 'collection' | 'counter'

export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  collection: 'Collection',
  counter: 'Counter',
}

export interface Customer {
  id: number
  name: string
  phone: string | null
  city: string | null
  customer_type: CustomerType
  /** When true, day print outputs 2 priced bills for this customer’s albums. Default false = 1. */
  two_bill_prints: boolean
  created_at: string
}

/** Orders are identified by their order number in every table. */
export interface Order {
  order_no: number
  order_date: string
  customer_id: number
  customer_name: string
  customer_type: CustomerType
  phone: string | null
  album_name: string | null
  notes: string | null
  status: OrderStatus
  /** Login user who saved the order (auth uid). Admin-only in the UI. */
  created_by: string | null
  created_at: string
}

export interface OrderLine {
  id: number
  order_no: number
  item_id: number | null
  item_size_id: number | null
  /** Includes the finish, e.g. "Normal High Gloss". */
  item_name: string
  finish: string | null
  category: Category
  size: string | null
  qty: number
  sort: number
  /** False for Crystal / Emboss lines that are billed but not counted in the sheet total. */
  counts_in_total: boolean
}

export interface LineAmount {
  line_id: number
  rate: number
  amount: number
}

export interface OrderAmount {
  order_no: number
  total: number
  advance: number
}

/** An order with its lines, plus prices when the viewer is admin. */
export interface FullOrder extends Order {
  lines: (OrderLine & { rate?: number; amount?: number })[]
  total?: number
  advance?: number
  /** From the customer record — day print uses 2 copies when true. */
  two_bill_prints?: boolean
  /** Login username of created_by — filled only for admin views. */
  created_by_username?: string | null
}
