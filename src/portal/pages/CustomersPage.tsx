import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  isRateAliasOf12x36,
  listCustomers,
  listDefaultRates,
  listItems,
  listItemSizes,
  loadCustomerOrders,
  rateKey,
  totalSheets,
} from '../api'
import { money, prettyDate } from '../format'
import { errorMessage, supabase } from '../supabase'
import { CustomerTypeTag, CustomerTypeToggle } from '../CustomerTypeToggle'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type Category,
  type Customer,
  type CustomerType,
  type FullOrder,
  type Item,
  type ItemSize,
} from '../types'

type Selection = { kind: 'defaults' } | { kind: 'customer'; id: number } | { kind: 'new' }
type Msg = { ok: boolean; text: string } | null

/** Default Matt surcharge over Gloss when seeding a new size / customer rate. */
const MATT_PLUS = 5
const cleanRate = (v: string) => v.replace(/[^\d.]/g, '')
const cleanSize = (v: string) => v.replace(/\s+/g, '').replace(/[X*×]/g, 'x')

function DefaultsPanel({
  items,
  sizes,
  rates,
  onSaved,
}: {
  items: Item[]
  sizes: ItemSize[]
  rates: Map<string, number>
  onSaved: () => void
}) {
  const [itemEdits, setItemEdits] = useState(() =>
    Object.fromEntries(items.map((i) => [i.id, { name: i.name, active: i.active }])),
  )
  const [sizeEdits, setSizeEdits] = useState(() =>
    Object.fromEntries(sizes.map((s) => [s.id, { size: s.size, active: s.active }])),
  )
  const [rateEdits, setRateEdits] = useState(() => {
    const map: Record<string, string> = {}
    for (const s of sizes) {
      const it = items.find((i) => i.id === s.item_id)
      const finishes = it?.finishes?.length ? it.finishes : ['']
      for (const f of finishes) {
        const k = rateKey(s.id, f)
        map[k] = String(rates.get(k) ?? (f === 'Matt' ? (rates.get(rateKey(s.id, 'Gloss')) ?? 0) + MATT_PLUS : 0))
      }
    }
    return map
  })
  const [addSizeFor, setAddSizeFor] = useState<number | null>(null)
  const [newSize, setNewSize] = useState({ size: '', rate: '' })
  const [newItem, setNewItem] = useState({ name: '', category: 'sheet' as Category, size: '12x36', rate: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)

  const base12x36 = (itemId: number) => sizes.find((s) => s.item_id === itemId && s.size === '12x36')

  const setRate = (sizeId: number, finish: string, value: string) =>
    setRateEdits((prev) => {
      const cleaned = cleanRate(value)
      const next = { ...prev, [rateKey(sizeId, finish)]: cleaned }
      // Keep Matt = Gloss + ₹5 unless Matt was already customized.
      if (finish === 'Gloss') {
        const mattK = rateKey(sizeId, 'Matt')
        if (mattK in prev) {
          const oldGloss = Number(prev[rateKey(sizeId, 'Gloss')] ?? 0) || 0
          const mattVal = prev[mattK] ?? ''
          if (mattVal === '' || Number(mattVal) === oldGloss + MATT_PLUS) {
            next[mattK] = String((Number(cleaned) || 0) + MATT_PLUS)
          }
        }
      }
      // Mirror 12x36 → 12x30 / 12x24 in the form (billing always uses 12x36).
      const edited = sizes.find((s) => s.id === sizeId)
      if (edited?.size === '12x36') {
        const finishes = finish === 'Gloss' ? ['Gloss', 'Matt'] : [finish]
        for (const alias of sizes.filter((s) => s.item_id === edited.item_id && isRateAliasOf12x36(s.size))) {
          for (const f of finishes) {
            const src = rateKey(sizeId, f)
            if (src in next || f === finish) next[rateKey(alias.id, f)] = next[src] ?? cleaned
          }
        }
      }
      return next
    })

  const run = async (work: () => Promise<void>, done: string) => {
    setBusy(true)
    setMsg(null)
    try {
      await work()
      setMsg({ ok: true, text: done })
      onSaved()
    } catch (e) {
      setMsg({ ok: false, text: errorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async () => {
      for (const it of items) {
        const e = itemEdits[it.id]
        if (e && (e.name.trim() !== it.name || e.active !== it.active)) {
          const { error } = await supabase.from('items').update({ name: e.name.trim() || it.name, active: e.active }).eq('id', it.id)
          if (error) throw error
        }
      }
      for (const s of sizes) {
        const e = sizeEdits[s.id]
        if (!e) continue
        const size = cleanSize(e.size) || s.size
        // Alias sizes keep their labels; only in-use can change here.
        if (isRateAliasOf12x36(s.size)) {
          if (e.active !== s.active) {
            const { error } = await supabase.from('item_sizes').update({ active: e.active }).eq('id', s.id)
            if (error) throw error
          }
          continue
        }
        if (size !== s.size || e.active !== s.active) {
          const { error } = await supabase.from('item_sizes').update({ size, active: e.active }).eq('id', s.id)
          if (error) throw error
        }
        const it = items.find((i) => i.id === s.item_id)
        const finishes = it?.finishes?.length ? it.finishes : ['']
        for (const f of finishes) {
          const k = rateKey(s.id, f)
          const next = Number(rateEdits[k] ?? 0) || 0
          if (next !== (rates.get(k) ?? 0)) {
            const { error } = await supabase
              .from('item_size_prices')
              .upsert({ item_size_id: s.id, finish: f, default_rate: next }, { onConflict: 'item_size_id,finish' })
            if (error) throw error
          }
        }
        // Keep 12x30 / 12x24 prices mirrored to 12x36
        if (s.size === '12x36') {
          for (const alias of sizes.filter((a) => a.item_id === s.item_id && isRateAliasOf12x36(a.size))) {
            for (const f of finishes) {
              const next = Number(rateEdits[rateKey(s.id, f)] ?? 0) || 0
              const { error } = await supabase
                .from('item_size_prices')
                .upsert({ item_size_id: alias.id, finish: f, default_rate: next }, { onConflict: 'item_size_id,finish' })
              if (error) throw error
            }
          }
        }
      }
    }, 'Default prices saved')

  const addSize = (itemId: number) =>
    run(async () => {
      const size = cleanSize(newSize.size)
      if (!size) throw new Error('Enter a size, e.g. 12x30')
      const it = items.find((i) => i.id === itemId)
      const gloss = Number(newSize.rate) || 0
      const sort = Math.max(0, ...sizes.filter((s) => s.item_id === itemId).map((s) => s.sort)) + 1
      const { data, error } = await supabase.from('item_sizes').insert({ item_id: itemId, size, sort }).select('id').single()
      if (error) throw error.code === '23505' ? new Error(`${size} already exists for this item`) : error
      if (it?.finishes?.length) {
        const rows = it.finishes.map((f) => ({
          item_size_id: data.id,
          finish: f,
          default_rate: f === 'Matt' ? gloss + MATT_PLUS : gloss,
        }))
        const { error: e2 } = await supabase.from('item_size_prices').insert(rows)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase
          .from('item_size_prices')
          .insert({ item_size_id: data.id, finish: '', default_rate: gloss })
        if (e2) throw e2
      }
      setAddSizeFor(null)
      setNewSize({ size: '', rate: '' })
    }, 'Size added')

  const addItem = () =>
    run(async () => {
      const size = cleanSize(newItem.size)
      if (!newItem.name.trim() || !size) throw new Error('Enter the item name and a size')
      const sort = Math.max(0, ...items.filter((i) => i.category === newItem.category).map((i) => i.sort)) + 1
      const { data: item, error } = await supabase
        .from('items')
        .insert({ name: newItem.name.trim(), category: newItem.category, sort })
        .select('id')
        .single()
      if (error) throw error
      const { data: sz, error: e2 } = await supabase.from('item_sizes').insert({ item_id: item.id, size, sort: 1 }).select('id').single()
      if (e2) throw e2
      const { error: e3 } = await supabase
        .from('item_size_prices')
        .insert({ item_size_id: sz.id, finish: '', default_rate: Number(newItem.rate) || 0 })
      if (e3) throw e3
      setNewItem({ name: '', category: newItem.category, size: newItem.size, rate: '' })
    }, 'Item added')

  return (
    <div className="p-card">
      <div className="p-card__head">
        <h2>Default price list</h2>
        <small>Gloss / Matt separate (Matt = Gloss + ₹{MATT_PLUS}). 12x30 / 12x24 always match 12x36.</small>
      </div>
      <div className="p-table-wrap">
        <table className="p-table p-pricetable">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th className="r">Gloss / rate (₹)</th>
              <th className="r">Matt (₹)</th>
              <th className="r">In use</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.map((cat) => {
              const list = items.filter((i) => i.category === cat)
              if (!list.length) return null
              return (
                <Fragment key={cat}>
                  <tr className="p-group-row">
                    <td colSpan={5}>{CATEGORY_LABEL[cat]}</td>
                  </tr>
                  {list.map((it) => {
                    const ie = itemEdits[it.id]
                    if (!ie) return null
                    const itemSizes = sizes.filter((s) => s.item_id === it.id)
                    const span = itemSizes.length + 1
                    const hasFinish = Boolean(it.finishes?.length)
                    return (
                      <Fragment key={it.id}>
                        {itemSizes.map((s, idx) => {
                          const se = sizeEdits[s.id]
                          if (!se) return null
                          const alias = isRateAliasOf12x36(s.size)
                          const rateSize = alias ? base12x36(it.id) ?? s : s
                          const glossKey = rateKey(rateSize.id, hasFinish ? 'Gloss' : '')
                          const mattKey = rateKey(rateSize.id, 'Matt')
                          return (
                            <tr key={s.id} className={ie.active && se.active ? '' : 'p-faded'}>
                              {idx === 0 && (
                                <td rowSpan={span} className="p-itemcell">
                                  <input
                                    className="p-input p-input--cell"
                                    value={ie.name}
                                    onChange={(ev) => setItemEdits({ ...itemEdits, [it.id]: { ...ie, name: ev.target.value } })}
                                  />
                                  <label className="p-check p-check--sm">
                                    <input
                                      type="checkbox"
                                      checked={ie.active}
                                      onChange={(ev) => setItemEdits({ ...itemEdits, [it.id]: { ...ie, active: ev.target.checked } })}
                                    />
                                    Item in use
                                  </label>
                                  {hasFinish ? (
                                    <div className="p-finish-note">Gloss / Matt · separate prices · Matt default = Gloss + ₹{MATT_PLUS}</div>
                                  ) : null}
                                </td>
                              )}
                              <td>
                                {alias ? (
                                  <span className="p-muted">
                                    {s.size} <small>· same as 12x36</small>
                                  </span>
                                ) : (
                                  <input
                                    className="p-input p-input--cell p-input--size"
                                    value={se.size}
                                    onChange={(ev) => setSizeEdits({ ...sizeEdits, [s.id]: { ...se, size: ev.target.value } })}
                                  />
                                )}
                              </td>
                              <td className="r">
                                {alias ? (
                                  <span className="p-muted">{rateEdits[glossKey] ?? '—'}</span>
                                ) : (
                                  <input
                                    className="p-rate"
                                    inputMode="decimal"
                                    value={rateEdits[glossKey] ?? ''}
                                    onChange={(ev) => setRate(s.id, hasFinish ? 'Gloss' : '', ev.target.value)}
                                  />
                                )}
                              </td>
                              <td className="r">
                                {hasFinish ? (
                                  alias ? (
                                    <span className="p-muted">{rateEdits[mattKey] ?? '—'}</span>
                                  ) : (
                                    <input
                                      className="p-rate"
                                      inputMode="decimal"
                                      value={rateEdits[mattKey] ?? ''}
                                      onChange={(ev) => setRate(s.id, 'Matt', ev.target.value)}
                                    />
                                  )
                                ) : (
                                  <span className="p-muted">—</span>
                                )}
                              </td>
                              <td className="r">
                                <input
                                  type="checkbox"
                                  checked={se.active}
                                  onChange={(ev) => setSizeEdits({ ...sizeEdits, [s.id]: { ...se, active: ev.target.checked } })}
                                />
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="p-addsize-row">
                          {itemSizes.length === 0 && (
                            <td>
                              <b>{ie.name}</b>
                            </td>
                          )}
                          {addSizeFor === it.id ? (
                            <>
                              <td>
                                <input
                                  className="p-input p-input--cell p-input--size"
                                  placeholder="e.g. 12x30"
                                  value={newSize.size}
                                  onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                                  autoFocus
                                />
                              </td>
                              <td className="r">
                                <input
                                  className="p-rate"
                                  inputMode="decimal"
                                  placeholder={hasFinish ? 'Gloss ₹' : '₹'}
                                  value={newSize.rate}
                                  onChange={(e) => setNewSize({ ...newSize, rate: cleanRate(e.target.value) })}
                                />
                              </td>
                              <td className="r p-muted">{hasFinish ? `Matt = Gloss + ${MATT_PLUS}` : '—'}</td>
                              <td className="r p-nowrap">
                                <button type="button" className="p-btn p-btn--sm p-btn--grad" disabled={busy} onClick={() => addSize(it.id)}>
                                  Add
                                </button>{' '}
                                <button type="button" className="p-btn p-btn--sm" onClick={() => setAddSizeFor(null)}>
                                  ✕
                                </button>
                              </td>
                            </>
                          ) : (
                            <td colSpan={4}>
                              <button
                                type="button"
                                className="p-btn p-btn--text p-btn--sm"
                                onClick={() => {
                                  setAddSizeFor(it.id)
                                  setNewSize({ size: '', rate: '' })
                                }}
                              >
                                + Add size for {ie.name}
                              </button>
                            </td>
                          )}
                        </tr>
                      </Fragment>
                    )
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="p-sub-label">Add a new item</p>
      <div className="p-additem">
        <input className="p-input" placeholder="Item name (e.g. Pearl Sheet)" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
        <select className="p-input p-select" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <input className="p-input" placeholder="Size" value={newItem.size} onChange={(e) => setNewItem({ ...newItem, size: e.target.value })} />
        <input className="p-input" inputMode="decimal" placeholder="Rate ₹" value={newItem.rate} onChange={(e) => setNewItem({ ...newItem, rate: cleanRate(e.target.value) })} />
        <button type="button" className="p-btn" onClick={addItem} disabled={busy || !newItem.name.trim()}>
          + Add item
        </button>
      </div>

      <div className="p-savebar">
        <span className={msg ? (msg.ok ? 'p-ok' : 'p-err') : 'p-muted'}>{msg?.text ?? 'Untick “In use” to hide an item or size from the order form.'}</span>
        <button type="button" className="p-btn p-btn--grad" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save prices'}
        </button>
      </div>
    </div>
  )
}

function CustomerPanel({
  customer,
  items,
  sizes,
  defaults,
  onSaved,
  onDeleted,
}: {
  customer: Customer | null
  items: Item[]
  sizes: ItemSize[]
  defaults: Map<string, number>
  onSaved: (c: Customer) => void
  onDeleted: () => void
}) {
  const [form, setForm] = useState<{
    name: string
    phone: string
    city: string
    type: CustomerType | ''
    twoBillPrints: boolean
  }>({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    city: customer?.city ?? '',
    type: customer?.customer_type ?? '',
    twoBillPrints: customer?.two_bill_prints ?? false,
  })
  const [rates, setRates] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [orders, setOrders] = useState<FullOrder[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const customerId = customer?.id

  useEffect(() => {
    if (!customerId) return
    supabase
      .from('customer_rates')
      .select('item_size_id, finish, rate')
      .eq('customer_id', customerId)
      .then(({ data }) => {
        const map = Object.fromEntries(
          (data ?? []).map((r) => [rateKey(r.item_size_id as number, (r.finish as string) ?? ''), String(Number(r.rate))]),
        )
        setRates(map)
        setOriginal(map)
      })
    loadCustomerOrders(customerId, 8)
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [customerId])

  const save = async () => {
    if (!form.name.trim()) return setMsg({ ok: false, text: 'Name is required' })
    if (!form.type) return setMsg({ ok: false, text: 'Choose Collection or Counter' })
    setBusy(true)
    setMsg(null)
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        customer_type: form.type,
        two_bill_prints: form.twoBillPrints,
      }
      const { data, error } = customer
        ? await supabase.from('customers').update(payload).eq('id', customer.id).select().single()
        : await supabase.from('customers').insert(payload).select().single()
      if (error) throw error
      const saved = data as Customer

      const upserts = Object.entries(rates)
        .filter(([, v]) => v !== '')
        .map(([key, v]) => {
          const [sizeId, finish = ''] = key.split('::')
          return { customer_id: saved.id, item_size_id: Number(sizeId), finish, rate: Number(v) }
        })
      const cleared = Object.keys(original).filter((key) => (rates[key] ?? '') === '')
      if (upserts.length) {
        const { error: e } = await supabase
          .from('customer_rates')
          .upsert(upserts, { onConflict: 'customer_id,item_size_id,finish' })
        if (e) throw e
      }
      for (const key of cleared) {
        const [sizeId, finish = ''] = key.split('::')
        const { error: e } = await supabase
          .from('customer_rates')
          .delete()
          .eq('customer_id', saved.id)
          .eq('item_size_id', Number(sizeId))
          .eq('finish', finish)
        if (e) throw e
      }
      setOriginal({ ...rates })
      setMsg({ ok: true, text: customer ? 'Saved' : 'Customer added' })
      onSaved(saved)
    } catch (e) {
      setMsg({ ok: false, text: errorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!customer || !window.confirm(`Delete ${customer.name}? This only works if they have no orders.`)) return
    const { error } = await supabase.from('customers').delete().eq('id', customer.id)
    if (error) {
      setMsg({ ok: false, text: error.code === '23503' ? 'This customer has orders, so it cannot be deleted.' : errorMessage(error) })
      return
    }
    onDeleted()
  }

  const changed = Object.entries(rates).filter(([key, v]) => v !== '' && Number(v) !== defaults.get(key)).length

  const rateRows = (it: Item) => {
    const itemSizes = sizes.filter((s) => s.item_id === it.id && s.active)
    const base = itemSizes.find((s) => s.size === '12x36')
    const finishes = it.finishes?.length ? it.finishes : ['']
    return itemSizes.flatMap((s) =>
      finishes.map((finish, fIdx) => {
        const alias = isRateAliasOf12x36(s.size)
        const rateSize = alias && base ? base : s
        const key = rateKey(rateSize.id, finish)
        const rowKey = `${s.id}::${finish}`
        const v = rates[key] ?? ''
        const def = defaults.get(key) ?? 0
        const special = v !== '' && Number(v) !== def
        return (
          <tr key={rowKey}>
            <td>{fIdx === 0 ? it.name : ''}</td>
            <td className="p-muted">
              {s.size || '—'}
              {finish ? ` · ${finish}` : ''}
              {alias ? ' · same as 12x36' : ''}
            </td>
            <td className="r p-muted">{money(def)}</td>
            <td className="r">
              {alias ? (
                <span className="p-muted">{v !== '' ? v : String(def)}</span>
              ) : (
                <input
                  className={`p-rate${special ? ' is-changed' : ''}`}
                  inputMode="decimal"
                  placeholder={String(def)}
                  value={v}
                  onChange={(e) => setRates({ ...rates, [key]: cleanRate(e.target.value) })}
                />
              )}
            </td>
          </tr>
        )
      }),
    )
  }

  return (
    <div className="p-stack">
      <div className="p-card">
        <div className="p-card__head">
          <h2>{customer ? customer.name : 'New customer'}</h2>
          {customer && (
            <button type="button" className="p-btn p-btn--sm p-btn--danger" onClick={remove}>
              Delete
            </button>
          )}
        </div>
        <div className="p-grid p-g2">
          <label className="p-field">
            <span>Customer / studio name</span>
            <input className="p-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus={!customer} />
          </label>
          <label className="p-field">
            <span>WhatsApp number</span>
            <input className="p-input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="p-field">
            <span>City</span>
            <input className="p-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <div className="p-field">
            <span>
              Customer type <small>· printed on the slip heading</small>
            </span>
            <CustomerTypeToggle value={form.type} onChange={(type) => setForm({ ...form, type })} />
          </div>
          <label className="p-opt">
            <input
              type="checkbox"
              checked={form.twoBillPrints}
              onChange={(e) => setForm({ ...form, twoBillPrints: e.target.checked })}
            />
            <div>
              <b>Print 2 bill copies</b>
              <span>On end-of-day print (with totals). Off = 1 copy. Default is single print.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="p-card">
        <div className="p-card__head">
          <h2>Rate list</h2>
          <small>Leave blank to use the default. Gloss and Matt have separate rates (Matt default = Gloss + ₹{MATT_PLUS}).</small>
        </div>
        <div className="p-table-wrap">
          <table className="p-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size / finish</th>
                <th className="r">Default rate</th>
                <th className="r">{form.name.trim() || 'Customer'} rate</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map((cat) => {
                const list = items.filter((i) => i.category === cat && i.active)
                if (!list.length) return null
                return (
                  <Fragment key={cat}>
                    <tr className="p-group-row">
                      <td colSpan={4}>{CATEGORY_LABEL[cat]}</td>
                    </tr>
                    {list.flatMap((it) => rateRows(it))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-savebar">
          <span className={msg ? (msg.ok ? 'p-ok' : 'p-err') : 'p-muted'}>{msg?.text ?? `${changed} special rate${changed === 1 ? '' : 's'}`}</span>
          <button type="button" className="p-btn p-btn--grad" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : customer ? 'Save customer & rates' : 'Add customer'}
          </button>
        </div>
      </div>

      {customer && (
        <div className="p-card">
          <div className="p-card__head">
            <h2>Recent albums</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-empty">No albums yet.</div>
          ) : (
            <div className="p-table-wrap">
              <table className="p-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order</th>
                    <th>Album</th>
                    <th className="r">Sheets</th>
                    <th className="r">Total</th>
                    <th className="r">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_no}>
                      <td>{prettyDate(o.order_date)}</td>
                      <td>
                        <Link className="p-ono" to={`/admin/orders/${o.order_no}`}>
                          {o.order_no}
                        </Link>
                      </td>
                      <td>{o.album_name || '—'}</td>
                      <td className="r">{totalSheets(o)}</td>
                      <td className="r p-money">{money(o.total)}</td>
                      <td className="r p-money">{money((o.total ?? 0) - (o.advance ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [sizes, setSizes] = useState<ItemSize[]>([])
  const [defaults, setDefaults] = useState<Map<string, number>>(new Map())
  const [sel, setSel] = useState<Selection>({ kind: 'defaults' })
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    Promise.all([listCustomers(), listItems(true), listItemSizes(true), listDefaultRates()])
      .then(([cs, its, szs, rates]) => {
        setCustomers(cs)
        setItems(its)
        setSizes(szs)
        setDefaults(rates)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [version])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? customers.filter((c) => c.name.toLowerCase().includes(s) || (c.phone ?? '').includes(s)) : customers
  }, [customers, q])

  const selected = sel.kind === 'customer' ? customers.find((c) => c.id === sel.id) ?? null : null

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Customers &amp; rate list</h1>
          <p>Gloss / Matt are separate (Matt = Gloss + ₹{MATT_PLUS}). Bunch (₹50) is auto-added on albums without a cover.</p>
        </div>
        <button type="button" className="p-btn p-btn--grad" onClick={() => setSel({ kind: 'new' })}>
          + Add customer
        </button>
      </div>

      {error && <div className="p-alert p-alert--error">{error}</div>}

      <div className="p-cols">
        <div className="p-card p-list">
          <input className="p-input p-search" placeholder={`Search ${customers.length} customers…`} value={q} onChange={(e) => setQ(e.target.value)} />
          <button
            type="button"
            className={`p-list__item p-list__item--defaults${sel.kind === 'defaults' ? ' is-active' : ''}`}
            onClick={() => setSel({ kind: 'defaults' })}
          >
            <div>
              <b>Default price list</b>
              <span>
                {items.length} items · {sizes.length} sizes
              </span>
            </div>
            <em>₹</em>
          </button>
          {shown.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`p-list__item${sel.kind === 'customer' && sel.id === c.id ? ' is-active' : ''}`}
              onClick={() => setSel({ kind: 'customer', id: c.id })}
            >
              <div>
                <b>{c.name}</b>
                <span>
                  {c.phone || 'no phone'}
                  {c.two_bill_prints ? ' · 2× bill print' : ''}
                </span>
              </div>
              <CustomerTypeTag type={c.customer_type} />
            </button>
          ))}
          {shown.length === 0 && <div className="p-empty">No customers found.</div>}
        </div>

        {sel.kind === 'defaults' ? (
          <DefaultsPanel key={`${items.length}:${sizes.length}`} items={items} sizes={sizes} rates={defaults} onSaved={reload} />
        ) : (
          <CustomerPanel
            key={sel.kind === 'customer' ? sel.id : 'new'}
            customer={selected}
            items={items}
            sizes={sizes}
            defaults={defaults}
            onSaved={(c) => {
              setCustomers((cs) => [...cs.filter((x) => x.id !== c.id), c].sort((a, b) => a.name.localeCompare(b.name)))
              setSel({ kind: 'customer', id: c.id })
            }}
            onDeleted={() => {
              setSel({ kind: 'defaults' })
              reload()
            }}
          />
        )}
      </div>
    </>
  )
}
