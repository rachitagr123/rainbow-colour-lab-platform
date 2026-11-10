// Checks the Album Desk database end to end with the real logins.
// Usage: ADMIN_PW='…' STAFF_PW='…' node scripts/check-portal.mjs
// Creates one test order for "customer1" and deletes it again at the end.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const URL_ = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY
const DOMAIN = 'rainbowcolourlabs.com'

let failures = 0
const ok = (label, pass, detail = '') => {
  if (!pass) failures++
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
}

const client = () => createClient(URL_, KEY, { auth: { persistSession: false } })

async function login(id, pw) {
  const sb = client()
  const { error } = await sb.auth.signInWithPassword({ email: `${id}@${DOMAIN}`, password: pw })
  ok(`login as ${id}`, !error, error?.message)
  return error ? null : sb
}

async function count(sb, table) {
  const { data, error } = await sb.from(table).select('*')
  return error ? `error: ${error.message}` : data.length
}

const anon = client()
for (const t of ['items', 'customers', 'orders', 'item_size_prices', 'customer_rates']) {
  const n = await count(anon, t)
  ok(`signed-out user sees no ${t}`, n === 0 || String(n).startsWith('error'), `got ${n}`)
}

const staff = await login('rcolourlab', process.env.STAFF_PW)
const admin = await login('admin', process.env.ADMIN_PW)
if (!staff || !admin) process.exit(1)

const ownProfile = async (sb) => {
  const { data: u } = await sb.auth.getUser()
  return (await sb.from('profiles').select('username, role, approved').eq('id', u.user.id).maybeSingle()).data
}
const staffProfile = await ownProfile(staff)
const adminProfile = await ownProfile(admin)
ok('rcolourlab has role staff', staffProfile?.role === 'staff', JSON.stringify(staffProfile))
ok('admin has role admin', adminProfile?.role === 'admin', JSON.stringify(adminProfile))

const items = (await staff.from('items').select('id, name, category')).data ?? []
const sizes = (await staff.from('item_sizes').select('id, item_id, size')).data ?? []
const customers = (await staff.from('customers').select('id, name')).data ?? []
ok('staff can list items', items.length > 0, `${items.length} items`)
ok('staff can list sizes', sizes.length > 0, `${sizes.length} item sizes`)
ok('staff can list customers', customers.length > 0, `${customers.length} customers`)

for (const t of ['item_size_prices', 'customer_rates', 'order_amounts', 'order_line_amounts']) {
  const n = await count(staff, t)
  ok(`staff cannot read ${t}`, n === 0, `got ${n}`)
}
const { error: staffPw } = await staff.rpc('admin_set_password', {
  p_user_id: '00000000-0000-0000-0000-000000000000',
  p_password: 'nope123',
})
ok('staff cannot reset passwords', Boolean(staffPw), staffPw?.message)
const { data: staffUsers } = await staff.rpc('admin_list_users')
ok('staff cannot list users', !staffUsers?.length)

const prices = (await admin.from('item_size_prices').select('item_size_id, default_rate')).data ?? []
ok('admin can read default prices', prices.length === sizes.length, `${prices.length} prices for ${sizes.length} sizes`)
const { data: users, error: usersErr } = await admin.rpc('admin_list_users')
ok('admin can list users', users?.length >= 2, usersErr?.message ?? users?.map((u) => `${u.username}:${u.role}`).join(', '))

// Price a test order: two sheet sizes + one cover, for customer1, with one special rate.
const cust = customers.find((c) => c.name === 'customer1') ?? customers[0]
const sheetItem = items.find((i) => i.category === 'sheet')
const coverItem = items.find((i) => i.category === 'cover')
const sheetSize = sizes.find((s) => s.item_id === sheetItem.id)
const coverSize = sizes.find((s) => s.item_id === coverItem.id)
const priceOf = (sizeId) => Number(prices.find((p) => p.item_size_id === sizeId)?.default_rate ?? 0)

const specialRate = priceOf(sheetSize.id) - 5
const { error: rateErr } = await admin
  .from('customer_rates')
  .upsert({ customer_id: cust.id, item_size_id: sheetSize.id, rate: specialRate })
ok('admin can set a customer special rate', !rateErr, rateErr?.message)

const { data: created, error: createErr } = await staff.rpc('create_order', {
  p_customer_id: cust.id,
  p_album_name: 'CHECK SCRIPT – safe to delete',
  p_notes: 'automated test',
  p_phone: '',
  p_order_date: null,
  p_lines: [
    { item_size_id: sheetSize.id, qty: 30 },
    { item_size_id: coverSize.id, qty: 1 },
  ],
})
ok('staff can submit an order', !createErr, createErr?.message ?? `order no ${created?.order_no}`)

if (created) {
  const { data: staffView } = await staff.from('orders').select('*, order_lines(*)').eq('order_no', created.order_no).single()
  ok('staff sees the order and its lines', staffView?.order_lines?.length === 2)
  const { data: byNo } = await admin.from('order_lines').select('order_no').eq('order_no', created.order_no)
  ok('order lines are looked up by order number', byNo?.length === 2)
  const { data: staffAmt } = await staff.from('order_amounts').select('*').eq('order_no', created.order_no)
  ok('staff cannot see the order total', (staffAmt ?? []).length === 0)

  const expected = specialRate * 30 + priceOf(coverSize.id)
  const { data: waTotal, error: waErr } = await staff.rpc('order_total', { p_order_no: created.order_no })
  ok('staff get only the total for WhatsApp', Number(waTotal) === expected, waErr?.message ?? `₹${waTotal}`)
  const { data: amt } = await admin.from('order_amounts').select('total').eq('order_no', created.order_no).single()
  ok(
    'order priced with customer special rate + default cover price',
    Number(amt?.total) === expected,
    `total ₹${amt?.total}, expected ₹${expected} (${specialRate}×30 + ${priceOf(coverSize.id)})`,
  )

  const { error: delErr } = await admin.from('orders').delete().eq('order_no', created.order_no)
  ok('admin can delete the test order', !delErr, delErr?.message)
}
await admin.from('customer_rates').delete().eq('customer_id', cust.id).eq('item_size_id', sheetSize.id)

// Customer type (collection / counter) and one cover / one box per album.
const { data: counterCust, error: ctErr } = await staff
  .from('customers')
  .insert({ name: 'CHECK counter customer', customer_type: 'counter' })
  .select()
  .single()
ok('staff can add a counter customer', !ctErr && counterCust?.customer_type === 'counter', ctErr?.message)
const coverSizes = sizes.filter((s) => items.find((i) => i.id === s.item_id)?.category === 'cover')
if (counterCust) {
  const { error: twoCovers } = await staff.rpc('create_order', {
    p_customer_id: counterCust.id, p_album_name: 'CHECK', p_notes: '', p_phone: '', p_order_date: null,
    p_lines: [{ item_size_id: sheetSize.id, qty: 10 }, { item_size_id: coverSizes[0].id, qty: 1 }, { item_size_id: coverSizes[1].id, qty: 1 }],
  })
  ok('an album cannot have two covers', Boolean(twoCovers), twoCovers?.message)

  const { data: co, error: coErr } = await staff.rpc('create_order', {
    p_customer_id: counterCust.id, p_album_name: 'CHECK', p_notes: '', p_phone: '', p_order_date: null,
    p_lines: [{ item_size_id: sheetSize.id, qty: 10 }, { item_size_id: coverSizes[0].id, qty: 5 }],
  })
  ok('counter customer order saves', !coErr, coErr?.message)
  if (co) {
    const { data: o } = await staff.from('orders').select('customer_type, order_lines(category, qty)').eq('order_no', co.order_no).single()
    ok('order is marked counter (slip says INDIGO ALBUM (COUNTER))', o?.customer_type === 'counter', o?.customer_type)
    const coverLine = o?.order_lines.find((l) => l.category === 'cover')
    ok('cover quantity is forced to 1', coverLine?.qty === 1, `qty ${coverLine?.qty}`)
    await admin.from('orders').delete().eq('order_no', co.order_no)
  }
  await admin.from('orders').delete().eq('customer_id', counterCust.id)
  await admin.from('customers').delete().eq('id', counterCust.id)
}
const { data: oldCust } = await staff.from('customers').select('customer_type').eq('id', cust.id).single()
ok('existing customers default to collection', oldCust?.customer_type === 'collection', oldCust?.customer_type)

// Sign-up: new accounts are unapproved staff and see nothing until admin approves them.
const testId = `checkbot${Date.now().toString().slice(-6)}`
const { error: takenErr } = await client().rpc('sign_up_staff', { p_username: 'admin', p_password: 'whatever1', p_full_name: 'X', p_phone: '' })
ok('sign-up cannot take the "admin" login ID', Boolean(takenErr), takenErr?.message)
const { error: signupErr } = await client().rpc('sign_up_staff', {
  p_username: testId,
  p_password: 'check-pass-123',
  p_full_name: 'Check Bot',
  p_phone: '',
})
ok('anyone can sign up', !signupErr, signupErr?.message)
if (!signupErr) {
  const fresh = await login(testId, 'check-pass-123')
  if (fresh) {
    const p = await ownProfile(fresh)
    ok('new account is staff and not approved', p?.role === 'staff' && p?.approved === false, JSON.stringify(p))
    ok('unapproved account sees no customers', (await count(fresh, 'customers')) === 0)
    ok('unapproved account sees no orders', (await count(fresh, 'orders')) === 0)
    const { error: blocked } = await fresh.rpc('create_order', {
      p_customer_id: cust.id, p_album_name: 'x', p_notes: '', p_phone: '', p_order_date: null,
      p_lines: [{ item_size_id: sheetSize.id, qty: 1 }],
    })
    ok('unapproved account cannot submit orders', Boolean(blocked), blocked?.message)
    const { error: selfApprove } = await fresh.rpc('admin_set_approved', { p_user_id: (await fresh.auth.getUser()).data.user.id, p_approved: true })
    ok('new account cannot approve itself', Boolean(selfApprove), selfApprove?.message)

    const { data: list } = await admin.rpc('admin_list_users')
    const row = list?.find((u) => u.username === testId)
    ok('admin sees the new sign-up as pending', row && !row.approved)
    const { error: apprErr } = await admin.rpc('admin_set_approved', { p_user_id: row.id, p_approved: true })
    ok('admin can approve it', !apprErr, apprErr?.message)
    ok('approved account can see customers', (await count(fresh, 'customers')) > 0)
    ok('approved account still cannot see prices', (await count(fresh, 'item_size_prices')) === 0)
    const { error: delUserErr } = await admin.rpc('admin_delete_user', { p_user_id: row.id })
    ok('admin can delete the test account', !delUserErr, delUserErr?.message)
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
