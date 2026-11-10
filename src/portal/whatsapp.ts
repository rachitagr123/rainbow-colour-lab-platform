import { totalSheets } from './api'
import { money, slipDate, waNumber } from './format'
import { CATEGORY_LABEL, CATEGORY_ORDER, type FullOrder } from './types'

/** Plain-text slip for WhatsApp — the album total only, never rates or line amounts. */
export function whatsappText(order: FullOrder, total: number | null) {
  const parts = [
    `*Rainbow Colour Lab* – Indigo Album (${order.customer_type === 'counter' ? 'Counter' : 'Collection'})`,
    `Order No: *${order.order_no}*`,
    `Date: ${slipDate(order.order_date)}`,
    `Name: ${order.customer_name}`,
  ]
  if (order.album_name) parts.push(`Album: ${order.album_name}`)
  for (const cat of CATEGORY_ORDER) {
    const lines = order.lines.filter((l) => l.category === cat)
    if (lines.length === 0) continue
    parts.push('', `*${CATEGORY_LABEL[cat]}*`)
    for (const l of lines) parts.push(`• ${l.item_name}${l.size ? ` (${l.size})` : ''} – ${l.qty}`)
  }
  parts.push('', `Total sheets: ${totalSheets(order)}`)
  if (total != null) parts.push(`*Total amount: ${money(total)}*`)
  if (order.notes) parts.push(`Note: ${order.notes}`)
  parts.push('', 'Thank you! – Rainbow Colour Lab, Jabalpur')
  return parts.join('\n')
}

/** Free click-to-chat link: opens WhatsApp with the message typed, staff presses Send. */
export function whatsappLink(order: FullOrder, total: number | null) {
  return `https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(whatsappText(order, total))}`
}
