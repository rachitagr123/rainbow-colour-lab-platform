// Checks the order and billing rules against the live database, logged in as a manager,
// plus what a staff login can and cannot do when STAFF_PW is set.
// Usage: MANAGER_ID=agrawal MANAGER_PW='…' STAFF_ID=rcolourlab STAFF_PW='…' node scripts/check-order-rules.mjs
// Creates temporary customers and a few orders, then deletes all of them.
// Each create_order call uses up one order number even when refused or deleted; the script
// prints the SQL to reset the counter at the end.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })

let failures = 0
const ok = (label, pass, detail = '') => {
  if (!pass) failures++
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
}
const section = (title) => console.log(`\n── ${title} ──`)

const { error: loginErr } = await sb.auth.signInWithPassword({
  email: `${process.env.MANAGER_ID ?? 'agrawal'}@rainbowcolourlabs.com`,
  password: process.env.MANAGER_PW ?? '',
})
ok('manager can log in', !loginErr, loginErr?.message)
if (loginErr) process.exit(1)

// ── Access ──
section('Access')
for (const t of ['items', 'customers', 'orders', 'item_size_prices', 'customer_rates']) {
  const { data } = await anon.from(t).select('*').limit(1)
  ok(`signed-out user sees no ${t}`, (data ?? []).length === 0)
}
const { data: me } = await sb.auth.getUser()
const { data: profile } = await sb.from('profiles').select('role, approved').eq('id', me.user.id).single()
ok('agrawal is an approved manager', profile?.role === 'manager' && profile?.approved, JSON.stringify(profile))
const { data: priceRows } = await sb.from('item_size_prices').select('item_size_id').limit(1)
ok('manager can read prices', (priceRows ?? []).length > 0)
const { error: listUsersErr } = await sb.rpc('admin_list_users')
ok('manager cannot list user accounts', Boolean(listUsersErr), listUsersErr?.message)
const { error: pwErr } = await sb.rpc('admin_set_password', { p_user_id: me.user.id, p_password: 'nope1234' })
ok('manager cannot reset passwords through the admin function', Boolean(pwErr), pwErr?.message)

// ── Catalogue ──
section('Catalogue after migration 016')
const items = (await sb.from('items').select('id, name, category, finishes, quota_exempt_for, active')).data ?? []
const sizes = (await sb.from('item_sizes').select('id, item_id, size, active')).data ?? []
const prices = (await sb.from('item_size_prices').select('item_size_id, finish, default_rate')).data ?? []
const item = (name) => items.find((i) => i.name === name)
const size = (name, label) => sizes.find((s) => s.item_id === item(name)?.id && s.size === label && s.active)
const price = (sizeId, finish = '') => Number(prices.find((p) => p.item_size_id === sizeId && p.finish === finish)?.default_rate)

const COMBO5 = '5 in 1 combo(table calendar, mini book, 2 keyring)'
const PIANO = 'Piano Combo (table calendar, mini book, 2 keyring)'
ok('5 in 1 combo is in Box & combos', item(COMBO5)?.category === 'box', item(COMBO5)?.category)
ok('Piano Combo is in Box & combos', item(PIANO)?.category === 'box', item(PIANO)?.category)
for (const name of ['Minibook', 'Keyring', 'Table Calendar', 'Wall Calendar', 'QR Code']) {
  ok(`${name} is in Other products`, item(name)?.category === 'product', item(name)?.category ?? 'missing')
}
const qr = size('QR Code', '')
ok('QR Code default price is ₹50', qr && price(qr.id) === 50, qr ? `₹${price(qr.id)}` : 'no size')
const crystal = size('Crystal', '12x18')
ok('Crystal size is 12x18', Boolean(crystal))
ok('Crystal has no active 12x36 size left', !size('Crystal', '12x36'))
ok('Crystal kept its old rate (₹85)', crystal && price(crystal.id) === 85, crystal ? `₹${price(crystal.id)}` : '')
ok(
  'Crystal is not counted for collection and counter',
  JSON.stringify(item('Crystal')?.quota_exempt_for) === JSON.stringify(['collection', 'counter']),
  JSON.stringify(item('Crystal')?.quota_exempt_for),
)
ok(
  'Emboss Sheet is not counted for counter only',
  JSON.stringify(item('Emboss Sheet')?.quota_exempt_for) === JSON.stringify(['counter']),
  JSON.stringify(item('Emboss Sheet')?.quota_exempt_for),
)
ok('Normal High is counted for everyone', !item('Normal High')?.quota_exempt_for?.length)
const bunch = sizes.find((s) => s.item_id === items.find((i) => i.category === 'bunch')?.id)
ok('Bunch default price is ₹50', bunch && price(bunch.id) === 50)

const { data: o41 } = await sb.from('orders').select('order_no, order_lines(category)').eq('order_no', 41).maybeSingle()
if (o41) ok('order 41 has no Bunch line', !o41.order_lines.some((l) => l.category === 'bunch'))
const { data: badBunch } = await sb
  .from('orders')
  .select('order_no, order_lines!inner(category)')
  .eq('order_lines.category', 'bunch')
const bunchOrders = new Set((badBunch ?? []).map((o) => o.order_no))
let packWithBunch = 0
if (bunchOrders.size) {
  const { data: packLines } = await sb.from('order_lines').select('order_no').in('category', ['cover', 'box']).in('order_no', [...bunchOrders])
  packWithBunch = new Set((packLines ?? []).map((l) => l.order_no)).size
}
ok('no existing order has Bunch together with a cover or box/combo', packWithBunch === 0, `${packWithBunch} found`)

// ── Orders ──
const { data: maxBefore } = await sb.from('orders').select('order_no').order('order_no', { ascending: false }).limit(1)
const startNo = maxBefore?.[0]?.order_no ?? 0
let created = 0
const NH12 = size('Normal High', '12x36')
const NH24 = size('Normal High', '12x24')
const emboss = size('Emboss Sheet', '12x18')
const coverSize = size('Cover Normal', '12x36')
const box2 = size('2 Piece Box', '12x36')
const combo5 = size(COMBO5, '12x36')
const minibook = size('Minibook', '6x9')
const keyring = size('Keyring', '')
const nhGloss = price(NH12.id, 'Gloss')
const nhMatt = price(NH12.id, 'Matt')

const temp = []
async function tempCustomer(type) {
  const { data, error } = await sb
    .from('customers')
    .insert({ name: `CHECK ${type} – safe to delete`, customer_type: type })
    .select()
    .single()
  if (error) throw error
  temp.push(data.id)
  return data
}
async function order(cust, lines) {
  created++
  const { data, error } = await sb.rpc('create_order', {
    p_customer_id: cust.id, p_album_name: 'CHECK SCRIPT – safe to delete', p_notes: '', p_phone: '', p_order_date: null, p_lines: lines,
  })
  if (error) return { error }
  const { data: o } = await sb
    .from('orders')
    .select('order_no, customer_type, order_lines(item_name, category, size, qty, counts_in_total, order_line_amounts(rate, amount)), order_amounts(total)')
    .eq('order_no', data.order_no)
    .single()
  return { order: o }
}
const lineOf = (o, name, cat) => o.order_lines.find((l) => l.item_name.startsWith(name) && (!cat || l.category === cat))
const hasBunch = (o) => o.order_lines.some((l) => l.category === 'bunch')
const total = (o) => Number(o.order_amounts?.total ?? o.order_amounts?.[0]?.total)
const counted = (o) =>
  o.order_lines.filter((l) => (l.category === 'sheet' || l.category === 'loose') && l.counts_in_total !== false).reduce((s, l) => s + l.qty, 0)

const collection = await tempCustomer('collection')
const counter = await tempCustomer('counter')
ok('new customers default to a single bill print', collection.two_bill_prints === false)

try {
  section('Collection: sheets + Crystal + QR Code, no cover/box')
  {
    const { order: o, error } = await order(collection, [
      { item_size_id: NH12.id, qty: 50, finish: 'Gloss' },
      { item_size_id: crystal.id, qty: 1 },
      { item_size_id: qr.id, qty: 2 },
    ])
    ok('order saves', !error, error?.message)
    if (o) {
      ok('Crystal line is not counted in the sheet total', lineOf(o, 'Crystal').counts_in_total === false)
      ok('Normal High line is counted', lineOf(o, 'Normal High').counts_in_total === true)
      ok('slip total sheets is 50 (Crystal excluded)', counted(o) === 50, `${counted(o)}`)
      ok('Crystal saved as size 12x18', lineOf(o, 'Crystal').size === '12x18')
      ok('QR Code keeps qty 2', lineOf(o, 'QR Code').qty === 2)
      ok('Bunch added (other products do not block it)', hasBunch(o))
      const expected = 50 * nhGloss + 85 + 2 * 50 + 50
      ok('total = sheets + Crystal + QR Code + Bunch', total(o) === expected, `₹${total(o)}, expected ₹${expected}`)
    }
  }

  section('Collection: loose sheets only')
  {
    const { order: o, error } = await order(collection, [{ item_size_id: NH24.id, qty: 10, finish: 'Matt', loose: true }])
    ok('order saves', !error, error?.message)
    if (o) {
      const l = lineOf(o, 'Normal High')
      ok('line saved as Loose sheets', l.category === 'loose', l.category)
      ok('12x24 billed at the 12x36 Matt rate', Number(l.order_line_amounts.rate) === nhMatt, `₹${l.order_line_amounts.rate}`)
      ok('no Bunch for loose sheets', !hasBunch(o))
      ok('total = 10 × Matt rate', total(o) === 10 * nhMatt, `₹${total(o)}`)
    }
  }

  section('Collection: sheets + loose sheets, no cover/box')
  {
    const { order: o, error } = await order(collection, [
      { item_size_id: NH12.id, qty: 20, finish: 'Gloss' },
      { item_size_id: NH12.id, qty: 5, finish: 'Gloss', loose: true },
    ])
    ok('order saves', !error, error?.message)
    if (o) {
      ok('Bunch added because album sheets are present', hasBunch(o))
      ok('slip total sheets counts both sections (25)', counted(o) === 25, `${counted(o)}`)
    }
  }

  section('Collection: sheets + 5 in 1 combo + Minibook')
  {
    const { order: o, error } = await order(collection, [
      { item_size_id: NH12.id, qty: 30, finish: 'Gloss' },
      { item_size_id: combo5.id, qty: 3 },
      { item_size_id: minibook.id, qty: 1 },
    ])
    ok('order saves', !error, error?.message)
    if (o) {
      ok('combo saved under Box & combos', lineOf(o, '5 in 1').category === 'box')
      ok('combo qty forced to 1', lineOf(o, '5 in 1').qty === 1)
      ok('no Bunch with a combo', !hasBunch(o))
    }
  }

  section('Collection: sheets + cover + Keyring')
  {
    const { order: o, error } = await order(collection, [
      { item_size_id: NH12.id, qty: 30, finish: 'Gloss' },
      { item_size_id: coverSize.id, qty: 1 },
      { item_size_id: keyring.id, qty: 2 },
    ])
    ok('cover and an other product can be ordered together', !error, error?.message)
    if (o) ok('no Bunch with a cover', !hasBunch(o))
  }

  section('Refused orders')
  {
    const { error: coverBox } = await order(collection, [
      { item_size_id: NH12.id, qty: 10, finish: 'Gloss' },
      { item_size_id: coverSize.id, qty: 1 },
      { item_size_id: combo5.id, qty: 1 },
    ])
    ok('cover + combo is refused', Boolean(coverBox), coverBox?.message)
    const { error: twoBoxes } = await order(collection, [
      { item_size_id: NH12.id, qty: 10, finish: 'Gloss' },
      { item_size_id: box2.id, qty: 1 },
      { item_size_id: combo5.id, qty: 1 },
    ])
    ok('box + combo is refused (only one)', Boolean(twoBoxes), twoBoxes?.message)
    const { error: noFinish } = await order(collection, [{ item_size_id: NH12.id, qty: 10 }])
    ok('Normal High without Gloss/Matt is refused', Boolean(noFinish), noFinish?.message)
  }

  section('Counter: sheets + Crystal + Emboss Sheet')
  {
    const { order: o, error } = await order(counter, [
      { item_size_id: NH12.id, qty: 40, finish: 'Gloss' },
      { item_size_id: crystal.id, qty: 2 },
      { item_size_id: emboss.id, qty: 3 },
    ])
    ok('order saves', !error, error?.message)
    if (o) {
      ok('order is marked counter', o.customer_type === 'counter')
      ok('Crystal not counted for counter', lineOf(o, 'Crystal').counts_in_total === false)
      ok('Emboss Sheet not counted for counter', lineOf(o, 'Emboss Sheet').counts_in_total === false)
      ok('slip total sheets is 40', counted(o) === 40, `${counted(o)}`)
      const expected = 40 * nhGloss + 2 * 85 + 3 * price(emboss.id) + 50
      ok('total = sheets + Crystal + Emboss + Bunch', total(o) === expected, `₹${total(o)}, expected ₹${expected}`)
    }
  }
  if (process.env.STAFF_PW) {
    section('Staff login')
    const staff = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
    const { error: staffLoginErr } = await staff.auth.signInWithPassword({
      email: `${process.env.STAFF_ID ?? 'rcolourlab'}@rainbowcolourlabs.com`,
      password: process.env.STAFF_PW,
    })
    ok('staff can log in', !staffLoginErr, staffLoginErr?.message)
    if (!staffLoginErr) {
      const { data: su } = await staff.auth.getUser()
      const { data: sp } = await staff.from('profiles').select('role, approved').eq('id', su.user.id).single()
      ok('rcolourlab is approved staff', sp?.role === 'staff' && sp?.approved, JSON.stringify(sp))

      for (const t of ['items', 'item_sizes', 'customers', 'orders']) {
        const { data } = await staff.from(t).select('*').limit(1)
        ok(`staff can read ${t}`, (data ?? []).length > 0)
      }
      for (const t of ['item_size_prices', 'customer_rates', 'order_amounts', 'order_line_amounts']) {
        const { data } = await staff.from(t).select('*').limit(1)
        ok(`staff cannot read ${t}`, (data ?? []).length === 0)
      }
      const { data: staffItems } = await staff.from('items').select('name, category, quota_exempt_for')
      ok('staff sees QR Code and the combos under the new sections', staffItems?.some((i) => i.name === 'QR Code' && i.category === 'product') && staffItems?.some((i) => i.name === COMBO5 && i.category === 'box'))

      const { error: staffUsersErr } = await staff.rpc('admin_list_users')
      ok('staff cannot list user accounts', Boolean(staffUsersErr), staffUsersErr?.message)
      const { error: staffPwErr } = await staff.rpc('admin_set_password', { p_user_id: su.user.id, p_password: 'nope1234' })
      ok('staff cannot reset passwords', Boolean(staffPwErr), staffPwErr?.message)

      const { error: priceErr } = await staff
        .from('item_size_prices')
        .upsert({ item_size_id: qr.id, finish: '', default_rate: 1 }, { onConflict: 'item_size_id,finish' })
      ok('staff cannot change default prices', Boolean(priceErr), priceErr?.message)
      ok('QR Code price is still ₹50', Number((await sb.from('item_size_prices').select('default_rate').eq('item_size_id', qr.id).single()).data?.default_rate) === 50)

      const { data: staffCust, error: staffCustErr } = await staff
        .from('customers')
        .insert({ name: 'CHECK staff-added – safe to delete', customer_type: 'collection' })
        .select()
        .single()
      ok('staff can add a customer from the order form', !staffCustErr, staffCustErr?.message)
      if (staffCust) {
        temp.push(staffCust.id)
        await staff.from('customers').update({ two_bill_prints: true, name: 'CHECK renamed by staff' }).eq('id', staffCust.id)
        const { data: after } = await sb.from('customers').select('name, two_bill_prints').eq('id', staffCust.id).single()
        ok('staff cannot edit a customer (name / 2 bill copies)', after?.two_bill_prints === false && after?.name.startsWith('CHECK staff-added'), JSON.stringify(after))
        await staff.from('customers').delete().eq('id', staffCust.id)
        const { data: still } = await sb.from('customers').select('id').eq('id', staffCust.id)
        ok('staff cannot delete a customer', (still ?? []).length === 1)

        section('Staff enters an order')
        created++
        const { data: so, error: soErr } = await staff.rpc('create_order', {
          p_customer_id: staffCust.id, p_album_name: 'CHECK staff order – safe to delete', p_notes: '', p_phone: '', p_order_date: null,
          p_lines: [
            { item_size_id: NH12.id, qty: 20, finish: 'Matt' },
            { item_size_id: crystal.id, qty: 1 },
            { item_size_id: NH12.id, qty: 4, finish: 'Matt', loose: true },
            { item_size_id: qr.id, qty: 1 },
          ],
        })
        ok('staff can submit an order', !soErr, soErr?.message)
        if (so) {
          const { data: view } = await staff.from('orders').select('order_no, order_lines(*)').eq('order_no', so.order_no).single()
          ok('staff sees the order lines', view?.order_lines?.length === 5, `${view?.order_lines?.length} lines`)
          ok('staff sees which lines are loose', view?.order_lines?.some((l) => l.category === 'loose'))
          ok('staff slip total sheets is 24 (Crystal excluded)', counted(view) === 24, `${counted(view)}`)
          const { data: amt } = await staff.from('order_amounts').select('total').eq('order_no', so.order_no)
          ok('staff cannot see the order total', (amt ?? []).length === 0)
          const expected = 20 * nhMatt + 85 + 4 * nhMatt + 50 + 50
          const { data: waTotal, error: waErr } = await staff.rpc('order_total', { p_order_no: so.order_no })
          ok('staff get only the total for WhatsApp, and it is right', Number(waTotal) === expected, waErr?.message ?? `₹${waTotal}, expected ₹${expected}`)

          await staff.from('orders').update({ status: 'delivered' }).eq('order_no', so.order_no)
          const { data: st } = await sb.from('orders').select('status').eq('order_no', so.order_no).single()
          ok('staff cannot change order status', st?.status !== 'delivered', st?.status)

          const { error: delErr } = await staff.rpc('delete_order', { p_order_no: so.order_no })
          ok('staff can delete an order', !delErr, delErr?.message)
          const { data: gone } = await sb.from('orders').select('order_no').eq('order_no', so.order_no)
          ok('deleted order is gone', (gone ?? []).length === 0)
        }
      }
    }
  }
} finally {
  section('Clean-up')
  for (const id of temp) {
    const { data: rows } = await sb.from('orders').select('order_no').eq('customer_id', id)
    for (const r of rows ?? []) {
      const { error } = await sb.rpc('delete_order', { p_order_no: r.order_no })
      if (error) ok(`delete test order ${r.order_no}`, false, error.message)
    }
    const { error } = await sb.from('customers').delete().eq('id', id)
    ok(`temporary customer ${id} removed`, !error, error?.message)
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
console.log(`\nUsed ${created} order numbers. To continue numbering from ${startNo}, run in Supabase → SQL Editor:`)
console.log(`  select setval('public.order_no_seq', (select max(order_no) from public.orders));`)
process.exit(failures ? 1 : 0)
