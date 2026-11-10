import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadOrdersBetween } from '../api'
import { prettyDate } from '../format'
import { Slip } from '../Slip'
import { errorMessage } from '../supabase'
import type { FullOrder } from '../types'

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
            <p>{orders ? `${orders.length} albums · one A4 page per album` : 'Loading…'}</p>
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
              🖨 Print {orders?.length ?? ''} slips
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-alert p-alert--error">{error}</div>}
      {orders && orders.length === 0 && <div className="p-empty">No albums on this date.</div>}

      <div className="p-print-area p-print-list">
        {orders?.map((o) => (
          <div className="p-print-page" key={o.order_no}>
            <Slip order={o} showPrices={withPrices} />
          </div>
        ))}
      </div>
    </div>
  )
}
