import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loadOrdersBetween, totalSheets } from '../api'
import { useAuth } from '../auth'
import { money, num, prettyDate, shiftDate, todayIST } from '../format'
import { errorMessage } from '../supabase'
import { STATUS_LABEL, type FullOrder, type OrderStatus } from '../types'

const STATUS_PILL: Record<OrderStatus, string> = {
  new: 'p-pill--violet',
  printing: 'p-pill--amber',
  ready: 'p-pill--grey',
  delivered: 'p-pill--green',
}

export default function OrdersPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const date = params.get('date') || todayIST()
  const [result, setResult] = useState<{ date: string; orders?: FullOrder[]; error?: string } | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    loadOrdersBetween(date, date, isAdmin)
      .then((list) => alive && setResult({ date, orders: list }))
      .catch((e) => alive && setResult({ date, error: errorMessage(e) }))
    return () => {
      alive = false
    }
  }, [date, isAdmin])

  const current = result?.date === date ? result : null
  const orders = current?.orders ?? null
  const error = current?.error ?? null

  const setDate = (d: string) => setParams(d === todayIST() ? {} : { date: d })

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!orders || !s) return orders ?? []
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(s) ||
        String(o.order_no).includes(s) ||
        (o.album_name ?? '').toLowerCase().includes(s),
    )
  }, [orders, q])

  const totals = useMemo(() => {
    const all = orders ?? []
    const total = all.reduce((s, o) => s + (o.total ?? 0), 0)
    const advance = all.reduce((s, o) => s + (o.advance ?? 0), 0)
    return {
      albums: all.length,
      sheets: all.reduce((s, o) => s + totalSheets(o), 0),
      total,
      advance,
      balance: total - advance,
      unpaid: all.filter((o) => (o.total ?? 0) - (o.advance ?? 0) > 0).length,
    }
  }, [orders])

  return (
    <>
      <div className="p-head">
        <div>
          <h1>{isAdmin ? 'Orders by date' : 'Orders'}</h1>
          <p>{isAdmin ? 'Every album entered on the selected day, with customer rates and totals.' : 'Albums entered on the selected day.'}</p>
        </div>
        {isAdmin ? (
          <Link className={`p-btn p-btn--grad p-btn--lg${orders?.length ? '' : ' is-disabled'}`} to={`/admin/print/${date}`}>
            🖨 Print all albums for {prettyDate(date, { day: '2-digit', month: 'short' })}
          </Link>
        ) : (
          <Link className="p-btn p-btn--grad" to="/admin/new">
            + New album order
          </Link>
        )}
      </div>

      {isAdmin && (
        <div className="p-stats">
          <div className="p-stat">
            <span>Albums</span>
            <b>{totals.albums}</b>
          </div>
          <div className="p-stat">
            <span>Total sheets</span>
            <b>{num(totals.sheets)}</b>
          </div>
          <div className="p-stat">
            <span>Order value</span>
            <b>{money(totals.total)}</b>
          </div>
          <div className="p-stat">
            <span>Balance to collect</span>
            <b>{money(totals.balance)}</b>
            {totals.unpaid > 0 && <small className="p-due">{totals.unpaid} albums unpaid</small>}
          </div>
        </div>
      )}

      <div className="p-card">
        <div className="p-toolbar">
          <div className="p-filters">
            <div className="p-datepick">
              <button type="button" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
                ‹
              </button>
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
              <button type="button" onClick={() => setDate(shiftDate(date, 1))} aria-label="Next day">
                ›
              </button>
            </div>
            {date !== todayIST() && (
              <button type="button" className="p-btn p-btn--sm" onClick={() => setDate(todayIST())}>
                Today
              </button>
            )}
            <input className="p-input p-search" placeholder="Search customer, album or order no." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {error && <div className="p-alert p-alert--error">{error}</div>}
        {!orders && !error && <div className="p-empty">Loading…</div>}
        {orders && shown.length === 0 && <div className="p-empty">No albums for {prettyDate(date)}.</div>}

        {shown.length > 0 && (
          <div className="p-table-wrap">
            <table className="p-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Album</th>
                  <th>Sheets</th>
                  <th>Cover / Box / Other</th>
                  {isAdmin && <th className="r">Total</th>}
                  {isAdmin && <th className="r">Advance</th>}
                  {isAdmin && <th className="r">Balance</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => {
                  const sheetTypes = o.lines.filter((l) => l.category === 'sheet').map((l) => l.item_name)
                  const extras = o.lines.filter((l) => l.category !== 'sheet').map((l) => l.item_name)
                  return (
                    <tr key={o.order_no} className="p-click" onClick={() => navigate(`/admin/orders/${o.order_no}`)}>
                      <td className="p-ono">{o.order_no}</td>
                      <td className="p-cust">
                        <b>{o.customer_name}</b>
                        <span>{o.phone || '—'}</span>
                      </td>
                      <td>{o.album_name || '—'}</td>
                      <td>
                        <b>{totalSheets(o)}</b> <span className="p-muted">· {[...new Set(sheetTypes)].join(', ') || '—'}</span>
                      </td>
                      <td className="p-muted">{extras.join(' · ') || '—'}</td>
                      {isAdmin && <td className="r p-money">{money(o.total)}</td>}
                      {isAdmin && <td className="r p-money">{money(o.advance)}</td>}
                      {isAdmin && (
                        <td className={`r p-money${(o.total ?? 0) - (o.advance ?? 0) > 0 ? ' p-due' : ''}`}>
                          {money((o.total ?? 0) - (o.advance ?? 0))}
                        </td>
                      )}
                      <td>
                        <span className={`p-pill ${STATUS_PILL[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {isAdmin && shown.length === orders?.length && (
                <tfoot>
                  <tr>
                    <td colSpan={3}>{totals.albums} albums</td>
                    <td>{num(totals.sheets)}</td>
                    <td />
                    <td className="r">{money(totals.total)}</td>
                    <td className="r">{money(totals.advance)}</td>
                    <td className="r">{money(totals.balance)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </>
  )
}
