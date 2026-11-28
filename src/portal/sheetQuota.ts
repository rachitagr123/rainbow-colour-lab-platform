export interface Quota {
  target: number
  count: number
  left: number
  /** Total entered and fully assigned, or nothing entered at all. */
  ok: boolean
}

/** Counts quantities toward a section total, skipping rows the customer's type does not count (Crystal / Emboss). */
export function quotaFor<R extends { qty: string }>(total: string, rows: R[], isExempt: (row: R) => boolean): Quota {
  const target = Number(total) || 0
  const count = rows.filter((r) => !isExempt(r)).reduce((s, r) => s + (Number(r.qty) || 0), 0)
  const left = target - count
  return { target, count, left, ok: target > 0 ? left === 0 : count === 0 }
}

export function quotaError(label: string, q: Quota) {
  if (q.target > 0) {
    if (q.left > 0) return `Assign the remaining ${q.left} ${label} before submitting.`
    if (q.left < 0) return `${label[0].toUpperCase()}${label.slice(1)} add up to ${q.count}, which is ${-q.left} over the total of ${q.target}.`
    return null
  }
  return q.count > 0 ? `Enter the total number of ${label} first.` : null
}

/** Album orders need sheet totals assigned; other-products-only orders can submit without sheets. */
export function orderFormReady(sheetQ: Quota, looseQ: Quota, hasProducts: boolean) {
  const anyTotal = sheetQ.target > 0 || looseQ.target > 0
  const usingSheets = anyTotal || sheetQ.count > 0 || looseQ.count > 0
  if (usingSheets) return anyTotal && sheetQ.ok && looseQ.ok
  return hasProducts && sheetQ.ok && looseQ.ok
}
