export type Role = 'admin' | 'staff'

export type Category = 'sheet' | 'cover' | 'box' | 'product'

export const CATEGORY_LABEL: Record<Category, string> = {
  sheet: 'Sheets',
  cover: 'Cover',
  box: 'Box',
  product: 'Combos & products',
}

export const CATEGORY_ORDER: Category[] = ['sheet', 'cover', 'box', 'product']

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

export interface Item {
  id: number
  name: string
  category: Category
  sort: number
  active: boolean
  /** e.g. ['Gloss', 'Matt']: chosen per order line, same price for each. */
  finishes: string[] | null
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
}
