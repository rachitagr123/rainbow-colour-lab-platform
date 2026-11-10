import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { loadOrder, totalSheets } from '../api'
import { useAuth } from '../auth'
import { money, prettyDate } from '../format'
import { Slip } from '../Slip'
import { whatsappLink } from '../whatsapp'
import { errorMessage, supabase } from '../supabase'
import { STATUS_LABEL, type FullOrder, type OrderStatus } from '../types'

export default function OrderPage() {
  const { orderNo } = useParams()
  const { isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const isNew = params.get('new') === '1'
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPrices, setShowPrices] = useState(isAdmin && !isNew)
  const [advance, setAdvance] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const printed = useRef(false)

  const [waTotal, setWaTotal] = useState<number | null>(null)

  useEffect(() => {
    loadOrder(Number(orderNo), isAdmin)
      .then((o) => {
        if (!o) return setError('Order not found.')
        setOrder(o)
        setAdvance(String(o.advance ?? 0))
      })
      .catch((e) => setError(errorMessage(e)))
  }, [orderNo, isAdmin])

  // Staff cannot read order amounts, so the WhatsApp total comes from a function that returns only the total.
  useEffect(() => {
    if (isAdmin) return
    supabase.rpc('order_total', { p_order_no: Number(orderNo) }).then(({ data }) => {
      if (data != null) setWaTotal(Number(data))
    })
  }, [orderNo, isAdmin])

  // Browsers use the page title as the "Save as PDF" file name.
  useEffect(() => {
    if (!order) return
    const prev = document.title
    document.title = `${order.order_no} - ${order.customer_name}`.replace(/[\\/:*?"<>|]+/g, ' ').trim()
    return () => {
      document.title = prev
    }
  }, [order])

  useEffect(() => {
    if (!order || printed.current || params.get('print') !== '1') return
    printed.current = true
    const next = new URLSearchParams(params)
    next.delete('print')
    setParams(next, { replace: true })
    window.setTimeout(() => window.print(), 400)
  }, [order, params, setParams])

  if (error) return <div className="p-alert p-alert--error">{error}</div>
  if (!order) return <div className="p-loading">Loading order…</div>

  const waHref = whatsappLink(order, isAdmin ? (order.total ?? null) : waTotal)

  const saveAdmin = async (patch: { status?: OrderStatus; advance?: number }) => {
    setSaving(true)
    setSaved(null)
    try {
      if (patch.status) {
        const { error: e } = await supabase.from('orders').update({ status: patch.status }).eq('order_no', order.order_no)
        if (e) throw e
      }
      if (patch.advance !== undefined) {
        const { error: e } = await supabase.from('order_amounts').update({ advance: patch.advance }).eq('order_no', order.order_no)
        if (e) throw e
      }
      setOrder({ ...order, ...patch })
      setSaved('Saved')
    } catch (e) {
      setSaved(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-order-view">
      <div className="p-stack no-print">
        <div className="p-card p-done">
          {isNew && <div className="p-done__icon">✓</div>}
          <h2>{isNew ? `Order ${order.order_no} saved` : `Order ${order.order_no}`}</h2>
          <p>
            {order.customer_name}
            {order.album_name ? ` · ${order.album_name}` : ''} · {totalSheets(order)} sheets · {prettyDate(order.order_date)}
          </p>

          <div className="p-steps">
            <div className="p-step">
              <i>✓</i>
              <div>
                <b>Saved to database</b>
                <span>{isAdmin ? 'Priced with this customer’s rate list' : 'With this customer’s rates (admin only)'}</span>
              </div>
            </div>
            <div className="p-step">
              <i>🖨</i>
              <div>
                <b>Print slip</b>
                <span>A4 · {showPrices ? 'with prices (admin copy)' : 'no prices (customer copy)'}</span>
              </div>
            </div>
            <div className="p-step">
              <i className="p-step--wa">✆</i>
              <div>
                <b>Send on WhatsApp</b>
                <span>
                  {order.phone ? `To ${order.phone} — press Send in WhatsApp` : 'No number saved — you can pick the contact in WhatsApp'}.
                  Includes the total amount only.
                </span>
              </div>
            </div>
          </div>

          <div className="p-actions">
            <div className="p-g2 p-grid">
              <button type="button" className="p-btn" onClick={() => window.print()}>
                🖨 Print slip
              </button>
              <a className="p-btn p-btn--wa" href={waHref} target="_blank" rel="noreferrer">
                Send on WhatsApp
              </a>
            </div>
            <Link className="p-btn p-btn--grad p-btn--lg" to="/admin/new">
              + New album order
            </Link>
            <Link className="p-btn p-btn--text" to={`/admin/orders?date=${order.order_date}`}>
              View all orders for {prettyDate(order.order_date)} →
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="p-card">
            <div className="p-card__head">
              <h2>Admin</h2>
              {saved && <small>{saving ? 'Saving…' : saved}</small>}
            </div>
            <div className="p-grid p-g2">
              <label className="p-field">
                <span>Status</span>
                <select
                  className="p-input p-select"
                  value={order.status}
                  onChange={(e) => saveAdmin({ status: e.target.value as OrderStatus })}
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="p-field">
                <span>Advance received (₹)</span>
                <input
                  className="p-input"
                  inputMode="decimal"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value.replace(/[^\d.]/g, ''))}
                  onBlur={() => Number(advance) !== order.advance && saveAdmin({ advance: Number(advance) || 0 })}
                />
              </label>
            </div>
            <div className="p-sum-row">
              <span>Total</span>
              <b>{money(order.total)}</b>
            </div>
            <div className="p-sum-row">
              <span>Balance</span>
              <b>{money((order.total ?? 0) - (order.advance ?? 0))}</b>
            </div>
            <label className="p-opt">
              <input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)} />
              <div>
                <b>Show prices on slip</b>
                <span>Untick to print the customer copy</span>
              </div>
            </label>
          </div>
        )}
      </div>

      <div>
        <div className="p-preview-head no-print">
          <h3>Slip preview</h3>
          <span className="p-pill p-pill--grey">A4 · {showPrices ? 'with prices' : 'no prices'}</span>
        </div>
        <div className="p-paper p-print-area">
          <Slip order={order} showPrices={showPrices} />
        </div>
      </div>
    </div>
  )
}
