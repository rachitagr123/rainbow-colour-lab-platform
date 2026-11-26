import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadOrdersBetween } from '../api'
import { prettyDate } from '../format'
import { Slip } from '../Slip'
import { errorMessage } from '../supabase'
import type { FullOrder } from '../types'

function slipCount(orders: FullOrder[]) {
  return orders.reduce((n, o) => n + (o.two_bill_prints ? 2 : 1), 0)
}

export default function PrintDayPage() {
  const { date = '' } = useParams()
  const [orders, setOrders] = useState<FullOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [withPrices, setWithPrices] = useState(true)

  useEffect(() => {
    const prev = document.title
    document.title = `Albums ${date}`
    return () => {
      document.title = prev
    }
  }, [date])

  useEffect(() => {
    loadOrdersBetween(date, date, true)
      .then((list) => setOrders([...list].sort((a, b) => a.order_no - b.order_no)))
      .catch((e) => setError(errorMessage(e)))
  }, [date])

  return (
    <div className="p-printday">
      <div className="p-printbar no-print">
        <div className="p-printbar__inner">
          <div>
            <h1>Print · {prettyDate(date, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</h1>
            <p>
              {orders
                ? `${orders.length} albums · ${slipCount(orders)} slips (1 each, or 2 if customer is marked) · A4`
                : 'Loading…'}
            </p>
          </div>
          <div className="p-printbar__right">
            <label className="p-check">
              <input type="checkbox" checked={withPrices} onChange={(e) => setWithPrices(e.target.checked)} />
              Include rates &amp; totals
            </label>
            <Link className="p-btn" to={`/admin/orders?date=${date}`}>
              ← Back
            </Link>
            <button type="button" className="p-btn p-btn--grad" disabled={!orders?.length} onClick={() => window.print()}>
              🖨 Print {orders ? slipCount(orders) : ''} slips
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-alert p-alert--error">{error}</div>}
      {orders && orders.length === 0 && <div className="p-empty">No albums on this date.</div>}

      <div className="p-print-area p-print-list">
        {orders?.flatMap((o) =>
          Array.from({ length: o.two_bill_prints ? 2 : 1 }, (_, i) => (
            <div className="p-print-page" key={`${o.order_no}-${i + 1}`}>
              <Slip order={o} showPrices={withPrices} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}
