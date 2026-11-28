import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Customer, Item, ItemSize } from './types'

const auth = vi.hoisted(() => ({ isOffice: false }))

vi.mock('./auth', () => ({ useAuth: () => auth }))
vi.mock('./supabase', () => ({ supabase: {}, errorMessage: (e: unknown) => String(e) }))

const items: Item[] = [
  { id: 2, name: 'Normal High', category: 'sheet', sort: 1, active: true, finishes: ['Gloss', 'Matt'], quota_exempt_for: null },
  { id: 22, name: 'Crystal', category: 'sheet', sort: 10, active: true, finishes: null, quota_exempt_for: ['collection', 'counter'] },
  { id: 23, name: 'Emboss Sheet', category: 'sheet', sort: 11, active: true, finishes: null, quota_exempt_for: ['counter'] },
  { id: 3, name: 'Cover Normal', category: 'cover', sort: 20, active: true, finishes: null, quota_exempt_for: null },
  { id: 8, name: '5 in 1 combo', category: 'box', sort: 40, active: true, finishes: null, quota_exempt_for: null },
  { id: 40, name: 'QR Code', category: 'product', sort: 50, active: true, finishes: null, quota_exempt_for: null },
]
const sizes: ItemSize[] = [
  { id: 1, item_id: 2, size: '12x36', sort: 1, active: true },
  { id: 2, item_id: 22, size: '12x18', sort: 1, active: true },
  { id: 3, item_id: 23, size: '12x18', sort: 1, active: true },
  { id: 4, item_id: 3, size: '12x36', sort: 1, active: true },
  { id: 5, item_id: 8, size: '12x36', sort: 1, active: true },
  { id: 6, item_id: 40, size: '', sort: 1, active: true },
]
const customers: Customer[] = []

vi.mock('./api', () => ({
  listItems: () => Promise.resolve(items),
  listItemSizes: () => Promise.resolve(sizes),
  listCustomers: () => Promise.resolve(customers),
  itemLabel: (i: Item) => i.name,
}))

const { default: NewOrderPage } = await import('./pages/NewOrderPage')

const exemptHints = () =>
  Array.from(document.querySelectorAll('.p-hints'), (h) => h.textContent ?? '').filter((t) => t.includes('billed separately'))

const renderForm = async () => {
  render(
    <MemoryRouter>
      <NewOrderPage />
    </MemoryRouter>,
  )
  await waitFor(() => expect(exemptHints().length).toBeGreaterThan(0))
}

describe('new order form', () => {
  beforeEach(() => {
    auth.isOffice = false
  })

  it('shows the sections in order', async () => {
    await renderForm()
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['1Customer', '2Sheets', '3Loose sheets', '4Cover', '5Box & combos', '6Other products', '7Notes', 'Order summary'])
  })

  it('never shows a rupee amount to staff', async () => {
    await renderForm()
    expect(document.body.textContent).not.toMatch(/₹\s?\d/)
    expect(screen.getByText(/get Bunch added automatically/)).toBeInTheDocument()
  })

  it('shows the Bunch price to managers and admins', async () => {
    auth.isOffice = true
    await renderForm()
    expect(screen.getByText(/get Bunch ₹50 added automatically/)).toBeInTheDocument()
  })

  it('tells a collection customer only Crystal is outside the total, in both sheet sections', async () => {
    await renderForm()
    expect(exemptHints()).toEqual([
      'Crystal is billed separately and not counted in the total.',
      'Crystal is billed separately and not counted in the total.',
    ])
  })

  it('cannot submit before the sheet total is entered', async () => {
    await renderForm()
    expect(screen.getByRole('button', { name: /Assign all sheets to submit/ })).toBeDisabled()
  })
})
