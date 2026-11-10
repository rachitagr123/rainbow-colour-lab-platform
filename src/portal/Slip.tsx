import { business, homeHeroLogo } from '../data/siteData'
import { totalSheets } from './api'
import { money, num, slipDate } from './format'
import { CATEGORY_LABEL, CATEGORY_ORDER, type FullOrder } from './types'

const SLIP_PHONES = ['93005 99405', '94253 23919', '79876 27054']

export function Slip({ order, showPrices }: { order: FullOrder; showPrices: boolean }) {
  const cols = showPrices ? 5 : 3
  const sheets = totalSheets(order)
  const balance = (order.total ?? 0) - (order.advance ?? 0)

  return (
    <article className="slip">
      <header className="slip__head">
        <img src={homeHeroLogo} alt="Rainbow Colour Lab" />
        <div className="slip__addr">
          {business.address}
          <br />
          Mob: {SLIP_PHONES.join(', ')}
          <br />
          {business.inquiryEmail}
        </div>
      </header>

      <div className="slip__title">INDIGO ALBUM ({order.customer_type === 'counter' ? 'COUNTER' : 'COLLECTION'})</div>

      <div className="slip__meta">
        <div>
          Name: <b>{order.customer_name}</b>
        </div>
        <div className="slip__right">
          Order No: <b className="slip__no">{order.order_no}</b>
        </div>
        <div>
          Album: <b>{order.album_name || '—'}</b>
        </div>
        <div className="slip__right">
          Date: <b>{slipDate(order.order_date)}</b>
        </div>
        <div>
          Mob: <b>{order.phone || '—'}</b>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Particular</th>
            <th>Size</th>
            <th className="r">Qty</th>
            {showPrices && <th className="r">Rate</th>}
            {showPrices && <th className="r">Amount</th>}
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.map((cat) => {
            const lines = order.lines.filter((l) => l.category === cat)
            if (lines.length === 0) return null
            return [
              <tr className="slip__group" key={cat}>
                <td colSpan={cols}>{CATEGORY_LABEL[cat].toUpperCase()}</td>
              </tr>,
              ...lines.map((l) => (
                <tr key={l.id}>
                  <td>{l.item_name}</td>
                  <td>{l.size || '—'}</td>
                  <td className="r">{l.qty}</td>
                  {showPrices && <td className="r">{num(l.rate)}</td>}
                  {showPrices && <td className="r">{num(l.amount)}</td>}
                </tr>
              )),
            ]
          })}
          <tr className="slip__sum">
            <td colSpan={2}>Total sheets</td>
            <td className="r">{sheets}</td>
            {showPrices && <td colSpan={2} />}
          </tr>
          {showPrices && (
            <>
              <tr className="slip__grand">
                <td colSpan={4}>TOTAL</td>
                <td className="r">{money(order.total)}</td>
              </tr>
              <tr className="slip__sum">
                <td colSpan={4}>ADVANCE</td>
                <td className="r">{money(order.advance)}</td>
              </tr>
              <tr className="slip__sum">
                <td colSpan={4}>BALANCE</td>
                <td className="r">{money(balance)}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <footer className="slip__foot">
        <div className="slip__note">{order.notes ? <><b>Note:</b> {order.notes}</> : null}</div>
        <div className="slip__sign">Auth. Signature</div>
      </footer>
    </article>
  )
}