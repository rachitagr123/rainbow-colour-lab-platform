import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCustomers, listItems, listItemSizes } from '../api'
import { todayIST } from '../format'
import { errorMessage, supabase } from '../supabase'
import { CustomerTypeTag, CustomerTypeToggle } from '../CustomerTypeToggle'
import type { Category, Customer, CustomerType, Item, ItemSize } from '../types'

interface Row {
  key: number
  itemId: number | ''
  sizeId: number | ''
  qty: string
}

let rowKey = 0

/** A new row for the item, keeping the previous row's size text when that item has it. */
function newRow(sizes: ItemSize[], itemId: number | '', preferSize?: string): Row {
  const options = sizes.filter((s) => s.item_id === itemId)
  const size = options.find((s) => s.size === preferSize) ?? options[0]
  return { key: ++rowKey, itemId, sizeId: size?.id ?? '', qty: '' }
}

function CustomerPicker({
  customers,
  selected,
  onSelect,
  onCreated,
}: {
  customers: Customer[]
  selected: Customer | null
  onSelect: (c: Customer | null) => void
  onCreated: (c: Customer) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newType, setNewType] = useState<CustomerType | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blurTimer = useRef<number | undefined>(undefined)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? customers.filter((c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').replace(/\D/g, '').includes(q))
      : customers
    return list.slice(0, 8)
  }, [customers, query])

  const pick = (c: Customer) => {
    onSelect(c)
    setQuery('')
    setOpen(false)
  }

  const startAdd = () => {
    setAdding(true)
    setOpen(false)
    setNewName(query.trim())
    setNewPhone('')
    setNewType('')
    setError(null)
  }

  const saveNew = async () => {
    if (!newName.trim()) return setError('Enter the customer name')
    if (!newType) return setError('Choose Collection or Counter')
    setSaving(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('customers')
      .insert({ name: newName.trim(), phone: newPhone.trim() || null, customer_type: newType })
      .select()
      .single()
    setSaving(false)
    if (err) return setError(errorMessage(err))
    onCreated(data as Customer)
    setAdding(false)
    setQuery('')
  }

  if (selected) {
    return (
      <div className="p-field">
        <span>Customer name</span>
        <div className="p-picked">
          <div>
            <b>
              {selected.name} <CustomerTypeTag type={selected.customer_type} />
            </b>
            <small>{selected.phone || 'No phone saved'}</small>
          </div>
          <button type="button" className="p-btn p-btn--sm" onClick={() => onSelect(null)}>
            Change
          </button>
        </div>
      </div>
    )
  }

  if (adding) {
    return (
      <div className="p-field">
        <span>New customer</span>
        <div className="p-newcust">
          <input className="p-input" placeholder="Customer / studio name" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <input className="p-input" placeholder="WhatsApp number" inputMode="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <CustomerTypeToggle value={newType} onChange={setNewType} />
          {error && <div className="p-alert p-alert--error">{error}</div>}
          <div className="p-row-actions">
            <button type="button" className="p-btn p-btn--grad p-btn--sm" onClick={saveNew} disabled={saving}>
              {saving ? 'Saving…' : 'Save customer'}
            </button>
            <button type="button" className="p-btn p-btn--sm" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-field">
      <span>
        Customer name <small>· type a few letters</small>
      </span>
      <input
        className="p-input"
        value={query}
        placeholder="Search customer…"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => {
          window.clearTimeout(blurTimer.current)
          setOpen(true)
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, matches.length))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (matches[active]) pick(matches[active])
            else startAdd()
          }
        }}
      />
      {open && (
        <div className="p-ac">
          {matches.map((c, i) => (
            <button
              type="button"
              key={c.id}
              className={`p-ac__item${i === active ? ' is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
            >
              <b>
                {c.name} <CustomerTypeTag type={c.customer_type} />
              </b>
              <span>{c.phone || 'no phone'}</span>
            </button>
          ))}
          {matches.length === 0 && <div className="p-ac__empty">No saved customer matches “{query}”.</div>}
          <button
            type="button"
            className={`p-ac__new${active === matches.length ? ' is-active' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={startAdd}
          >
            + Add {query.trim() ? `“${query.trim()}”` : 'a new customer'} (name + phone)
          </button>
        </div>
      )}
    </div>
  )
}

function LineRows({
  rows,
  items,
  sizes,
  onChange,
  addLabel,
  hintLabel,
  single = false,
  footer,
}: {
  rows: Row[]
  items: Item[]
  sizes: ItemSize[]
  onChange: (rows: Row[]) => void
  addLabel: string
  hintLabel: string
  /** One row only, with quantity fixed at 1 (cover, box). */
  single?: boolean
  footer?: ReactNode
}) {
  const update = (key: number, patch: Partial<Row>) => onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const sizeText = (id: number | '') => sizes.find((s) => s.id === id)?.size
  const addRow = () => {
    const row = newRow(sizes, items[0]?.id ?? '', sizeText(rows.at(-1)?.sizeId ?? ''))
    onChange([...rows, single ? { ...row, qty: '1' } : row])
  }

  const changeItem = (r: Row, itemId: number | '') => {
    const next = newRow(sizes, itemId, sizeText(r.sizeId))
    update(r.key, { itemId, sizeId: next.sizeId })
  }
  const used = new Set(rows.map((r) => r.itemId))

  return (
    <>
      {rows.length > 0 && (
        <div className="p-lines">
          <div className="p-line p-line--head">
            <span>Type</span>
            <span>Size</span>
            <span>Qty</span>
            <span />
          </div>
          {rows.map((r) => (
            <div className="p-line" key={r.key}>
              <select className="p-input p-select" value={r.itemId} onChange={(e) => changeItem(r, Number(e.target.value) || '')}>
                <option value="">Select…</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
              <select
                className="p-input p-select"
                value={r.sizeId}
                disabled={!r.itemId}
                onChange={(e) => update(r.key, { sizeId: Number(e.target.value) || '' })}
              >
                {!r.sizeId && <option value="">Size…</option>}
                {sizes
                  .filter((s) => s.item_id === r.itemId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.size}
                    </option>
                  ))}
              </select>
              {single ? (
                <input className="p-input is-readonly" value="1" readOnly title="Always 1 per album" />
              ) : (
                <input
                  className="p-input"
                  inputMode="numeric"
                  value={r.qty}
                  onChange={(e) => update(r.key, { qty: e.target.value.replace(/\D/g, '') })}
                  placeholder="0"
                />
              )}
              <button type="button" className="p-del" aria-label="Remove row" onClick={() => onChange(rows.filter((x) => x.key !== r.key))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {!(single && rows.length > 0) && (
        <div className="p-add-row">
          <button type="button" className="p-add" onClick={addRow}>
            + {addLabel}
          </button>
          {footer}
        </div>
      )}
      {items.length > 0 && (
        <div className="p-hints">
          <p className="p-sub-label">
            {hintLabel}
            {single ? ' · 1 per album' : ''}
          </p>
          <div className="p-chips">
            {items.map((it) => (
              <span key={it.id} className={`p-chip${used.has(it.id) ? ' is-active' : ''}`}>
                {it.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function NewOrderPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [sizes, setSizes] = useState<ItemSize[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState(todayIST())
  const [albumName, setAlbumName] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState<Record<Category, Row[]>>({ sheet: [], cover: [], box: [], product: [] })
  const [autoPrint, setAutoPrint] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listItems(), listItemSizes(), listCustomers()])
      .then(([its, szs, cs]) => {
        const sellable = its.filter((i) => szs.some((s) => s.item_id === i.id))
        setItems(sellable)
        setSizes(szs)
        setCustomers(cs)
        const firstSheet = sellable.find((i) => i.category === 'sheet')
        setRows((r) => ({ ...r, sheet: r.sheet.length ? r.sheet : [newRow(szs, firstSheet?.id ?? '')] }))
      })
      .catch((e) => setLoadError(errorMessage(e)))
  }, [])

  const byCat = (cat: Category) => items.filter((i) => i.category === cat)
  const setCat = (cat: Category) => (next: Row[]) => setRows((r) => ({ ...r, [cat]: next }))

  const selectCustomer = (c: Customer | null) => {
    setCustomer(c)
    setPhone(c?.phone ?? '')
  }

  const filled = (Object.values(rows).flat() as Row[]).filter((r) => r.sizeId && Number(r.qty) > 0)
  const itemName = (id: number | '') => items.find((i) => i.id === id)?.name ?? ''
  const sizeName = (id: number | '') => sizes.find((s) => s.id === id)?.size ?? ''
  const sheetCount = rows.sheet.filter((r) => r.sizeId).reduce((s, r) => s + (Number(r.qty) || 0), 0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!customer) return setError('Select or add a customer first.')
    if (filled.length === 0) return setError('Add at least one item with a quantity.')

    setSubmitting(true)
    const { data, error: err } = await supabase.rpc('create_order', {
      p_customer_id: customer.id,
      p_album_name: albumName,
      p_notes: notes,
      p_phone: phone,
      p_order_date: date,
      p_lines: filled.map((r) => ({ item_size_id: r.sizeId, qty: Number(r.qty) })),
    })
    setSubmitting(false)
    if (err) return setError(errorMessage(err))
    const { order_no } = data as { order_no: number }
    navigate(`/admin/orders/${order_no}?new=1${autoPrint ? '&print=1' : ''}`)
  }

  if (loadError) return <div className="p-alert p-alert--error">Could not load data: {loadError}</div>

  return (
    <form onSubmit={submit}>
      <div className="p-head">
        <div>
          <h1>New album order</h1>
          <p>Pick the customer, then sheets, cover and box. Rates are added automatically and only admin can see them.</p>
        </div>
      </div>

      <div className="p-order-layout">
        <div className="p-stack">
          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">1</span>Customer
              </h2>
              <small>Pick a saved customer or add a new one</small>
            </div>
            <div className="p-grid p-g2">
              <CustomerPicker
                customers={customers}
                selected={customer}
                onSelect={selectCustomer}
                onCreated={(c) => {
                  setCustomers((cs) => [...cs, c].sort((a, b) => a.name.localeCompare(b.name)))
                  selectCustomer(c)
                }}
              />
              <div className="p-grid p-g2 p-align-start">
                <label className="p-field">
                  <span>
                    WhatsApp number <small>· auto-filled</small>
                  </span>
                  <input className="p-input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
                </label>
                <label className="p-field">
                  <span>Date</span>
                  <input className="p-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </label>
                <label className="p-field">
                  <span>
                    Order no. <small>· auto</small>
                  </span>
                  <input className="p-input is-readonly" value="Given on submit" readOnly />
                </label>
                <label className="p-field">
                  <span>Album / design name</span>
                  <input className="p-input" value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="e.g. Rahul weds Priya" />
                </label>
              </div>
            </div>
          </section>

          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">2</span>Sheets
              </h2>
              <small>One album can mix several sheet types</small>
            </div>
            <LineRows
              rows={rows.sheet}
              items={byCat('sheet')}
              sizes={sizes}
              onChange={setCat('sheet')}
              addLabel="Add another sheet type"
              hintLabel="Sheet types available"
              footer={<span className="p-total-pill">Total: {sheetCount} sheets</span>}
            />
          </section>

          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">3</span>Cover
              </h2>
            </div>
            <LineRows rows={rows.cover} items={byCat('cover')} sizes={sizes} onChange={setCat('cover')} addLabel="Add cover" hintLabel="Covers available" single />
          </section>

          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">4</span>Box
              </h2>
            </div>
            <LineRows rows={rows.box} items={byCat('box')} sizes={sizes} onChange={setCat('box')} addLabel="Add box" hintLabel="Boxes available" single />
          </section>

          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">5</span>Combos &amp; other products
              </h2>
              <small>Optional</small>
            </div>
            <LineRows rows={rows.product} items={byCat('product')} sizes={sizes} onChange={setCat('product')} addLabel="Add product" hintLabel="Combos & products available" />
          </section>

          <section className="p-card">
            <div className="p-card__head">
              <h2>
                <span className="p-num">6</span>Notes
              </h2>
              <small>Printed on the slip</small>
            </div>
            <textarea className="p-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Cover name in gold foil. Delivery before Saturday." />
          </section>
        </div>

        <aside className="p-aside">
          <div className="p-card">
            <div className="p-card__head">
              <h2>Order summary</h2>
              <span className="p-pill p-pill--violet">Draft</span>
            </div>
            <div className="p-sum-big">
              <span>Total sheets</span>
              <b>{sheetCount}</b>
            </div>
            <div className="p-sum-row">
              <span>Customer</span>
              <b>{customer?.name ?? '—'}</b>
            </div>
            <div className="p-sum-row">
              <span>Album</span>
              <b>{albumName || '—'}</b>
            </div>
            {filled.length === 0 ? (
              <div className="p-sum-row">
                <span>Items</span>
                <b>—</b>
              </div>
            ) : (
              filled.map((r) => (
                <div className="p-sum-row" key={r.key}>
                  <span>{itemName(r.itemId)}</span>
                  <b>{`${sizeName(r.sizeId)} · ${r.qty}`}</b>
                </div>
              ))
            )}

            <label className="p-opt">
              <input type="checkbox" checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} />
              <div>
                <b>Print slip after saving</b>
                <span>A4, without rates or amounts</span>
              </div>
            </label>
            <div className="p-opt p-opt--static">
              <span className="p-wa-dot">✓</span>
              <div>
                <b>WhatsApp button on next screen</b>
                <span>Opens WhatsApp with the slip text ready to send</span>
              </div>
            </div>

            {error && <div className="p-alert p-alert--error">{error}</div>}

            <button className="p-btn p-btn--grad p-btn--lg p-btn--block" disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit order'}
            </button>
            <div className="p-lock">🔒 Rates &amp; totals are never shown to staff</div>
          </div>
        </aside>
      </div>
    </form>
  )
}
