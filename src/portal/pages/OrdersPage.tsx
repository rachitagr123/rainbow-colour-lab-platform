import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { deleteOrder, listUsernamesById, loadOrdersBetween, totalSheets } from '../api'
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

async function withCreators(list: FullOrder[], asAdmin: boolean) {
  if (!asAdmin) return list
  const names = await listUsernamesById(list.map((o) => o.created_by))
  return list.map((o) => ({
    ...o,
    created_by_username: o.created_by ? (names.get(o.created_by) ?? '—') : '—',
  }))
}

export default function OrdersPage() {
  const { isAdmin, isOffice } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const date = params.get('date') || todayIST()
  const [result, setResult] = useState<{ date: string; orders?: FullOrder[]; error?: string } | null>(null)
  const [q, setQ] = useState('')
  const [busyNo, setBusyNo] = useState<number | null>(null)

  const reload = () =>
    loadOrdersBetween(date, date, isOffice)
      .then((list) => withCreators(list, isAdmin))
      .then((list) => setResult({ date, orders: list }))
      .catch((e) => setResult({ date, error: errorMessage(e) }))

  useEffect(() => {
    let alive = true
    loadOrdersBetween(date, date, isOffice)
      .then((list) => withCreators(list, isAdmin))
      .then((list) => alive && setResult({ date, orders: list }))
      .catch((e) => alive && setResult({ date, error: errorMessage(e) }))
    return () => {
      alive = false
    }
  }, [date, isOffice, isAdmin])

  const remove = async (o: FullOrder, e: MouseEvent) => {
    e.stopPropagation()
    const ok = window.confirm(
      `Delete order ${o.order_no} for ${o.customer_name}? This removes it from the database and cannot be undone.`,
    )
    if (!ok) return
    setBusyNo(o.order_no)
    try {
      await deleteOrder(o.order_no)
      await reload()
    } catch (err) {
      setResult({ date, orders: result?.orders, error: errorMessage(err) })
    } finally {
      setBusyNo(null)
    }
  }

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
        (o.album_name ?? '').toLowerCase().includes(s) ||
        (isAdmin && (o.created_by_username ?? '').toLowerCase().includes(s)),
    )
  }, [orders, q, isAdmin])

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
          <h1>{isOffice ? 'Orders by date' : 'Orders'}</h1>
          <p>
            {isOffice
              ? 'Every album entered on the selected day, with customer rates and totals.'
              : 'Albums entered on the selected day.'}
          </p>
        </div>
        {isOffice ? (
          <Link className={`p-btn p-btn--grad p-btn--lg${orders?.length ? '' : ' is-disabled'}`} to={`/admin/print/${date}`}>
            🖨 Print all albums for {prettyDate(date, { day: '2-digit', month: 'short' })}
          </Link>
        ) : (
          <Link className="p-btn p-btn--grad" to="/admin/new">
            + New album order
          </Link>
        )}
      </div>

      {isOffice && (
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
            <input
              className="p-input p-search"
              placeholder={isAdmin ? 'Search customer, album, order no. or user id' : 'Search customer, album or order no.'}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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
                  {isAdmin && <th>User ID</th>}
                  <th>Album</th>
                  <th>Sheets</th>
                  <th>Cover / Box / Other</th>
                  {isOffice && <th className="r">Total</th>}
                  {isOffice && <th className="r">Advance</th>}
                  {isOffice && <th className="r">Balance</th>}
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => {
                  const isSheet = (c: string) => c === 'sheet' || c === 'loose'
                  const sheetTypes = o.lines.filter((l) => isSheet(l.category)).map((l) => l.item_name)
                  const extras = o.lines.filter((l) => !isSheet(l.category)).map((l) => l.item_name)
                  return (
                    <tr key={o.order_no} className="p-click" onClick={() => navigate(`/admin/orders/${o.order_no}`)}>
                      <td className="p-ono">{o.order_no}</td>
                      <td className="p-cust">
                        <b>{o.customer_name}</b>
                        <span>{o.phone || '—'}</span>
                      </td>
                      {isAdmin && <td className="p-userid">{o.created_by_username ?? '—'}</td>}
                      <td>{o.album_name || '—'}</td>
                      <td>
                        <b>{totalSheets(o)}</b> <span className="p-muted">· {[...new Set(sheetTypes)].join(', ') || '—'}</span>
                      </td>
                      <td className="p-muted">{extras.join(' · ') || '—'}</td>
                      {isOffice && <td className="r p-money">{money(o.total)}</td>}
                      {isOffice && <td className="r p-money">{money(o.advance)}</td>}
                      {isOffice && (
                        <td className={`r p-money${(o.total ?? 0) - (o.advance ?? 0) > 0 ? ' p-due' : ''}`}>
                          {money((o.total ?? 0) - (o.advance ?? 0))}
                        </td>
                      )}
                      <td>
                        <span className={`p-pill ${STATUS_PILL[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                      </td>
                      <td className="p-row-act">
                        <button
                          type="button"
                          className="p-btn p-btn--sm p-btn--danger"
                          disabled={busyNo === o.order_no}
                          onClick={(e) => remove(o, e)}
                        >
                          {busyNo === o.order_no ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {isOffice && shown.length === orders?.length && (
                <tfoot>
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3}>{totals.albums} albums</td>
                    <td>{num(totals.sheets)}</td>
                    <td />
                    <td className="r">{money(totals.total)}</td>
                    <td className="r">{money(totals.advance)}</td>
                    <td className="r">{money(totals.balance)}</td>
                    <td colSpan={2} />
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
