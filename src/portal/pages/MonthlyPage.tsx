import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadOrdersBetween, totalSheets } from '../api'
import { money, num, prettyDate, todayIST } from '../format'
import { errorMessage } from '../supabase'
import { CATEGORY_LABEL, CATEGORY_ORDER, type FullOrder } from '../types'

function monthBounds(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { from: `${ym}-01`, to: `${ym}-${String(days).padStart(2, '0')}`, days, y, m }
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return d.toISOString().slice(0, 7)
}

function CustomerMonthDetail({ name, monthLabel, orders }: { name: string; monthLabel: string; orders: FullOrder[] }) {
  const total = orders.reduce((s, o) => s + (o.total ?? 0), 0)
  const paid = orders.reduce((s, o) => s + (o.advance ?? 0), 0)
  const sheets = orders.reduce((s, o) => s + totalSheets(o), 0)

  return (
    <div className="p-detail">
      <div className="p-detail__head">
        <b>
          {name} · {monthLabel}
        </b>
        <span>
          {orders.length} album{orders.length === 1 ? '' : 's'} · {num(sheets)} sheets · {money(total)}
        </span>
      </div>
      <table className="p-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order</th>
            <th>Album</th>
            <th>Items</th>
            <th className="r">Sheets</th>
            <th className="r">Amount</th>
            <th className="r">Paid</th>
            <th className="r">Balance</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.order_no}>
              <td className="p-nowrap">{prettyDate(o.order_date)}</td>
              <td>
                <Link className="p-ono" to={`/admin/orders/${o.order_no}`} onClick={(e) => e.stopPropagation()}>
                  {o.order_no}
                </Link>
              </td>
              <td>{o.album_name || '—'}</td>
              <td className="p-muted">{o.lines.map((l) => `${l.item_name} ×${l.qty}`).join(', ')}</td>
              <td className="r">{totalSheets(o)}</td>
              <td className="r p-money">{money(o.total)}</td>
              <td className="r p-money">{money(o.advance)}</td>
              <td className={`r p-money${(o.total ?? 0) - (o.advance ?? 0) > 0 ? ' p-due' : ''}`}>{money((o.total ?? 0) - (o.advance ?? 0))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total for {monthLabel}</td>
            <td className="r">{num(sheets)}</td>
            <td className="r">{money(total)}</td>
            <td className="r">{money(paid)}</td>
            <td className="r">{money(total - paid)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function MonthlyPage() {
  const [ym, setYm] = useState(todayIST().slice(0, 7))
  const [openCustomer, setOpenCustomer] = useState<number | null>(null)
  const [result, setResult] = useState<{ ym: string; orders?: FullOrder[]; error?: string } | null>(null)
  const bounds = monthBounds(ym)

  useEffect(() => {
    let alive = true
    const { from, to } = monthBounds(ym)
    loadOrdersBetween(from, to, true)
      .then((list) => alive && setResult({ ym, orders: list }))
      .catch((e) => alive && setResult({ ym, error: errorMessage(e) }))
    return () => {
      alive = false
    }
  }, [ym])

  const orders = result?.ym === ym ? result.orders ?? null : null
  const error = result?.ym === ym ? result.error ?? null : null

  const stats = useMemo(() => {
    const list = orders ?? []
    const total = list.reduce((s, o) => s + (o.total ?? 0), 0)
    const advance = list.reduce((s, o) => s + (o.advance ?? 0), 0)

    const perDay = Array.from({ length: bounds.days }, (_, i) => {
      const date = `${ym}-${String(i + 1).padStart(2, '0')}`
      const dayOrders = list.filter((o) => o.order_date === date)
      return { date, day: i + 1, count: dayOrders.length, sunday: new Date(`${date}T00:00:00Z`).getUTCDay() === 0 }
    })

    const custMap = new Map<
      number,
      { id: number; name: string; albums: number; sheets: number; total: number; paid: number; orders: FullOrder[] }
    >()
    for (const o of list) {
      const c = custMap.get(o.customer_id) ?? { id: o.customer_id, name: o.customer_name, albums: 0, sheets: 0, total: 0, paid: 0, orders: [] }
      c.albums += 1
      c.sheets += totalSheets(o)
      c.total += o.total ?? 0
      c.paid += o.advance ?? 0
      c.orders.push(o)
      custMap.set(o.customer_id, c)
    }
    for (const c of custMap.values()) {
      c.orders.sort((a, b) => a.order_date.localeCompare(b.order_date) || a.order_no - b.order_no)
    }
    const customers = [...custMap.values()].sort((a, b) => b.total - a.total)

    const itemMap = new Map<string, { name: string; category: FullOrder['lines'][number]['category']; qty: number; amount: number }>()
    for (const o of list) {
      for (const l of o.lines) {
        const name = l.size ? `${l.item_name} ${l.size}` : l.item_name
        const key = `${l.category}:${name}`
        const it = itemMap.get(key) ?? { name, category: l.category, qty: 0, amount: 0 }
        it.qty += l.qty
        it.amount += l.amount ?? 0
        itemMap.set(key, it)
      }
    }

    return {
      albums: list.length,
      sheets: list.reduce((s, o) => s + totalSheets(o), 0),
      total,
      advance,
      balance: total - advance,
      unpaid: list.filter((o) => (o.total ?? 0) - (o.advance ?? 0) > 0).length,
      perDay,
      maxDay: Math.max(1, ...perDay.map((d) => d.count)),
      customers,
      items: [...itemMap.values()],
    }
  }, [orders, bounds.days, ym])

  const monthLabel = new Date(Date.UTC(bounds.y, bounds.m - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Monthly summary</h1>
          <p>Albums, sheets, order value and money still to collect for the month.</p>
        </div>
        <div className="p-head__actions no-print">
          <div className="p-datepick">
            <button type="button" onClick={() => setYm(shiftMonth(ym, -1))} aria-label="Previous month">
              ‹
            </button>
            <input type="month" value={ym} onChange={(e) => e.target.value && setYm(e.target.value)} />
            <button type="button" onClick={() => setYm(shiftMonth(ym, 1))} aria-label="Next month">
              ›
            </button>
          </div>
          <button type="button" className="p-btn p-btn--grad" onClick={() => window.print()}>
            🖨 Print summary
          </button>
        </div>
      </div>

      {error && <div className="p-alert p-alert--error">{error}</div>}

      <div className="p-print-area">
        <h2 className="p-print-only">Monthly summary · {monthLabel}</h2>
        <div className="p-stats p-stats--5">
          <div className="p-stat">
            <span>Albums</span>
            <b>{stats.albums}</b>
          </div>
          <div className="p-stat">
            <span>Sheets printed</span>
            <b>{num(stats.sheets)}</b>
          </div>
          <div className="p-stat">
            <span>Order value</span>
            <b>{money(stats.total)}</b>
          </div>
          <div className="p-stat">
            <span>Collected (advance)</span>
            <b>{money(stats.advance)}</b>
          </div>
          <div className="p-stat">
            <span>Balance to collect</span>
            <b>{money(stats.balance)}</b>
            {stats.unpaid > 0 && <small className="p-due">{stats.unpaid} albums unpaid</small>}
          </div>
        </div>

        <div className="p-card">
          <div className="p-card__head">
            <h2>Albums per day · {monthLabel}</h2>
            <div className="p-legend">
              <span>
                <i />
                Working day
              </span>
              <span>
                <i className="is-sun" />
                Sunday
              </span>
            </div>
          </div>
          <div className="p-chart">
            {stats.perDay.map((d) => (
              <div key={d.date} className={`p-chart__bar${d.sunday ? ' is-sun' : ''}`} title={`${d.day}: ${d.count} albums`}>
                {d.count > 0 && <em>{d.count}</em>}
                <span style={{ height: `${(d.count / stats.maxDay) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="p-axis">
            {stats.perDay.map((d) => (
              <span key={d.date}>{d.day === 1 || d.day % 5 === 0 ? d.day : ''}</span>
            ))}
          </div>
        </div>

        <div className={`p-two${openCustomer != null ? ' p-two--stacked' : ''}`}>
          <div className="p-card">
            <div className="p-card__head">
              <h2>Customers</h2>
              <small>{stats.customers.length} this month · click a customer to see their albums</small>
            </div>
            {stats.customers.length === 0 ? (
              <div className="p-empty">{orders ? 'No albums this month.' : 'Loading…'}</div>
            ) : (
              <div className="p-table-wrap">
                <table className="p-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th className="r">Albums</th>
                      <th className="r">Sheets</th>
                      <th className="r">Order value</th>
                      <th className="r">Paid</th>
                      <th className="r">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.customers.map((c) => {
                      const isOpen = openCustomer === c.id
                      return (
                        <Fragment key={c.id}>
                          <tr className={`p-click${isOpen ? ' is-open' : ''}`} onClick={() => setOpenCustomer(isOpen ? null : c.id)}>
                            <td>
                              <span className="p-caret">{isOpen ? '▾' : '▸'}</span> <b>{c.name}</b>
                            </td>
                            <td className="r">{c.albums}</td>
                            <td className="r">{num(c.sheets)}</td>
                            <td className="r p-money">{money(c.total)}</td>
                            <td className="r p-money">{money(c.paid)}</td>
                            <td className={`r p-money${c.total - c.paid > 0 ? ' p-due' : ''}`}>{money(c.total - c.paid)}</td>
                          </tr>
                          {isOpen && (
                            <tr className="p-detail-row">
                              <td colSpan={6}>
                                <CustomerMonthDetail name={c.name} monthLabel={monthLabel} orders={c.orders} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td className="r">{stats.albums}</td>
                      <td className="r">{num(stats.sheets)}</td>
                      <td className="r">{money(stats.total)}</td>
                      <td className="r">{money(stats.advance)}</td>
                      <td className="r">{money(stats.balance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="p-card">
            <div className="p-card__head">
              <h2>What was ordered</h2>
            </div>
            {stats.items.length === 0 && <div className="p-empty">Nothing yet.</div>}
            {CATEGORY_ORDER.map((cat) => {
              const list = stats.items.filter((i) => i.category === cat).sort((a, b) => b.qty - a.qty)
              if (!list.length) return null
              const max = Math.max(...list.map((i) => i.qty))
              return (
                <div key={cat}>
                  <p className="p-sub-label">{CATEGORY_LABEL[cat]}</p>
                  {list.map((i) => (
                    <div className="p-hbar" key={i.name} title={money(i.amount)}>
                      <b>{i.name}</b>
                      <div className="p-hbar__track">
                        <span style={{ width: `${(i.qty / max) * 100}%` }} />
                      </div>
                      <em>{num(i.qty)}</em>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
