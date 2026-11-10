const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function money(value: number | null | undefined) {
  return `₹${inr.format(Number(value ?? 0))}`
}

export function num(value: number | null | undefined) {
  return inr.format(Number(value ?? 0))
}

/** Today's date in India as YYYY-MM-DD. */
export function todayIST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

export function shiftDate(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function prettyDate(isoDate: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-IN', { ...opts, timeZone: 'UTC' })
}

export function slipDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function prettyDateTime(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

/** Digits only, with India's 91 prefix for 10-digit numbers — the format wa.me expects. */
export function waNumber(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}
