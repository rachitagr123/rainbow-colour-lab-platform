import { describe, expect, it } from 'vitest'
import { isRateAliasOf12x36, totalSheets } from './api'
import { quotaError, quotaFor } from './sheetQuota'
import type { FullOrder } from './types'

type Line = FullOrder['lines'][number]

const line = (patch: Partial<Line>): Line => ({
  id: 1,
  order_no: 1,
  item_id: 1,
  item_size_id: 1,
  item_name: 'Normal High Gloss',
  finish: 'Gloss',
  category: 'sheet',
  size: '12x36',
  qty: 1,
  sort: 1,
  counts_in_total: true,
  ...patch,
})

type FormRow = { itemId: number; qty: string }

const CRYSTAL = 22
const rows = (...r: [itemId: number, qty: string][]): FormRow[] => r.map(([itemId, qty]) => ({ itemId, qty }))
const crystalExempt = (r: FormRow) => r.itemId === CRYSTAL

describe('sheet total on the order form', () => {
  it('subtracts every counted sheet from the total', () => {
    const q = quotaFor('50', rows([2, '30'], [11, '20']), () => false)
    expect(q).toEqual({ target: 50, count: 50, left: 0, ok: true })
  })

  it('does not subtract Crystal (total 50 + 1 Crystal still leaves 0)', () => {
    const q = quotaFor('50', rows([2, '50'], [CRYSTAL, '1']), crystalExempt)
    expect(q.left).toBe(0)
    expect(q.ok).toBe(true)
  })

  it('counts Crystal when the customer type does not exempt it', () => {
    const q = quotaFor('50', rows([2, '50'], [CRYSTAL, '1']), () => false)
    expect(q.left).toBe(-1)
    expect(q.ok).toBe(false)
  })

  it('is not ready while sheets are left to assign', () => {
    const q = quotaFor('50', rows([2, '40']), () => false)
    expect(q.ok).toBe(false)
    expect(quotaError('sheets', q)).toBe('Assign the remaining 10 sheets before submitting.')
  })

  it('reports going over the total', () => {
    const q = quotaFor('50', rows([2, '55']), () => false)
    expect(quotaError('sheets', q)).toBe('Sheets add up to 55, which is 5 over the total of 50.')
  })

  it('treats an empty section as fine, so loose sheets are optional', () => {
    const q = quotaFor('', [], () => false)
    expect(q.ok).toBe(true)
    expect(quotaError('loose sheets', q)).toBeNull()
  })

  it('asks for a total when quantities are entered without one', () => {
    const q = quotaFor('', rows([2, '5']), () => false)
    expect(q.ok).toBe(false)
    expect(quotaError('loose sheets', q)).toBe('Enter the total number of loose sheets first.')
  })

  it('allows a section with only Crystal and no total', () => {
    expect(quotaFor('', rows([CRYSTAL, '2']), crystalExempt).ok).toBe(true)
  })
})

describe('total sheets on the slip', () => {
  it('adds album and loose sheets', () => {
    expect(totalSheets({ lines: [line({ qty: 40 }), line({ category: 'loose', qty: 10 })] })).toBe(50)
  })

  it('leaves out lines billed outside the sheet total', () => {
    const lines = [line({ qty: 50 }), line({ item_name: 'Crystal', qty: 1, counts_in_total: false })]
    expect(totalSheets({ lines })).toBe(50)
  })

  it('ignores covers, boxes, products and Bunch', () => {
    const lines = [
      line({ qty: 30 }),
      line({ category: 'cover', qty: 1 }),
      line({ category: 'box', qty: 1 }),
      line({ category: 'product', qty: 2 }),
      line({ category: 'bunch', qty: 1 }),
    ]
    expect(totalSheets({ lines })).toBe(30)
  })
})

describe('display sizes billed as 12x36', () => {
  it.each(['12x30', '12x24'])('%s uses the 12x36 rate', (size) => {
    expect(isRateAliasOf12x36(size)).toBe(true)
  })

  it.each(['12x36', '12x18', '8x24'])('%s has its own rate', (size) => {
    expect(isRateAliasOf12x36(size)).toBe(false)
  })
})
