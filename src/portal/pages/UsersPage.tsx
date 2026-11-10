import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { prettyDateTime } from '../format'
import { errorMessage, supabase } from '../supabase'
import type { Role } from '../types'

interface UserRow {
  id: string
  username: string
  role: Role
  full_name: string | null
  phone: string | null
  approved: boolean
  created_at: string
  last_sign_in_at: string | null
}

const PERMISSIONS: [string, boolean][] = [
  ['Enter new album orders', true],
  ['Print slip & send on WhatsApp (no prices)', true],
  ['Add a new customer (name + phone)', true],
  ['See rates, amounts & totals', false],
  ['Edit customer rate lists & default prices', false],
  ['Print all albums for a date (with prices)', false],
  ['Monthly summary', false],
  ['Approve accounts, manage users & passwords', false],
]

function Avatar({ u }: { u: UserRow }) {
  return (
    <div className="p-u">
      <i className={u.role === 'staff' ? 'is-staff' : ''}>{u.username.slice(0, 2).toUpperCase()}</i>
      <div>
        <b>{u.full_name || u.username}</b>
        <span>
          {u.username}
          {u.phone ? ` · ${u.phone}` : ''}
        </span>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [version, setVersion] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    supabase.rpc('admin_list_users').then(({ data, error: e }) => {
      if (e) return setError(errorMessage(e))
      setUsers((data ?? []) as UserRow[])
    })
  }, [version])

  const reload = () => setVersion((v) => v + 1)
  const pending = users.filter((u) => !u.approved)
  const accounts = users.filter((u) => u.approved)
  const target = users.find((u) => u.id === targetId) ?? accounts.find((u) => u.role === 'staff' && u.approved) ?? accounts[0] ?? null

  const act = async (label: string, call: PromiseLike<{ error: unknown }>) => {
    setActionMsg(null)
    const { error: e } = await call
    if (e) setActionMsg({ ok: false, text: errorMessage(e) })
    else {
      setActionMsg({ ok: true, text: label })
      reload()
    }
  }

  const approve = (u: UserRow) =>
    act(`${u.username} can now sign in and enter orders.`, supabase.rpc('admin_set_approved', { p_user_id: u.id, p_approved: true }))
  const revoke = (u: UserRow) =>
    act(`${u.username} can no longer see or enter orders.`, supabase.rpc('admin_set_approved', { p_user_id: u.id, p_approved: false }))
  const remove = (u: UserRow) => {
    if (!window.confirm(`Delete the account “${u.username}”? Their past orders are kept.`)) return
    act(`${u.username} deleted.`, supabase.rpc('admin_delete_user', { p_user_id: u.id }))
  }

  const strength = [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw) && /[a-z]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!target) return
    if (pw.length < 6) return setMsg({ ok: false, text: 'Use at least 6 characters.' })
    if (pw !== pw2) return setMsg({ ok: false, text: 'The two passwords do not match.' })
    setBusy(true)
    setMsg(null)
    const { error: err } =
      target.id === profile?.id
        ? await supabase.auth.updateUser({ password: pw })
        : await supabase.rpc('admin_set_password', { p_user_id: target.id, p_password: pw })
    setBusy(false)
    if (err) return setMsg({ ok: false, text: errorMessage(err) })
    setPw('')
    setPw2('')
    setMsg({ ok: true, text: `Password changed for ${target.username}.` })
  }

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Users &amp; passwords</h1>
          <p>Approve new staff accounts, remove access, and reset passwords. New sign-ups are always staff, never admin.</p>
        </div>
      </div>

      {error && <div className="p-alert p-alert--error">{error}</div>}
      {actionMsg && <div className={`p-alert ${actionMsg.ok ? 'p-alert--ok' : 'p-alert--error'}`}>{actionMsg.text}</div>}

      <div className="p-cols p-cols--wide">
        <div className="p-stack">
          {pending.length > 0 && (
            <div className="p-card p-card--attention">
              <div className="p-card__head">
                <h2>Waiting for approval</h2>
                <span className="p-pill p-pill--amber">{pending.length}</span>
              </div>
              <div className="p-table-wrap">
                <table className="p-table">
                  <thead>
                    <tr>
                      <th>Person</th>
                      <th>Signed up</th>
                      <th className="r" />
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <Avatar u={u} />
                        </td>
                        <td className="p-muted">{prettyDateTime(u.created_at)}</td>
                        <td className="r p-nowrap">
                          <button type="button" className="p-btn p-btn--sm p-btn--grad" onClick={() => approve(u)}>
                            Approve
                          </button>{' '}
                          <button type="button" className="p-btn p-btn--sm p-btn--danger" onClick={() => remove(u)}>
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="p-card">
            <div className="p-card__head">
              <h2>Accounts</h2>
              <small>{accounts.length} users</small>
            </div>
            <div className="p-table-wrap">
              <table className="p-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Last sign-in</th>
                    <th className="r" />
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Avatar u={u} />
                      </td>
                      <td>
                        <span className={`p-role${u.role === 'admin' ? ' p-role--admin' : ''}`}>{u.role === 'admin' ? 'Admin' : 'Staff'}</span>
                      </td>
                      <td className="p-muted">{prettyDateTime(u.last_sign_in_at)}</td>
                      <td className="r p-nowrap">
                        <button
                          type="button"
                          className="p-btn p-btn--sm"
                          onClick={() => {
                            setTargetId(u.id)
                            setMsg(null)
                            setPw('')
                            setPw2('')
                          }}
                        >
                          {u.id === profile?.id ? 'Change password' : 'Reset password'}
                        </button>{' '}
                        {u.role === 'staff' && (
                          <button type="button" className="p-btn p-btn--sm p-btn--danger" onClick={() => revoke(u)}>
                            Remove access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-card">
            <div className="p-card__head">
              <h2>What each role can do</h2>
            </div>
            <table className="p-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th className="r">Staff</th>
                  <th className="r">Admin</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(([label, staff]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className={`r ${staff ? 'p-ok' : 'p-err'}`}>{staff ? '✓' : '✕'}</td>
                    <td className="r p-ok">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {target && (
          <form className="p-card" onSubmit={submit}>
            <div className="p-card__head">
              <h2>
                {target.id === profile?.id ? 'Change password' : 'Reset password'} · {target.username}
              </h2>
            </div>
            <div className="p-grid">
              <label className="p-field">
                <span>Login ID</span>
                <input className="p-input is-readonly" value={target.username} readOnly />
              </label>
              <label className="p-field">
                <span>New password</span>
                <div className="p-pw">
                  <input className="p-input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
                  <button type="button" onClick={() => setShow((s) => !s)}>
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="p-meter">
                  {[1, 2, 3, 4].map((n) => (
                    <i key={n} className={pw && n <= strength ? 'is-on' : ''} />
                  ))}
                </div>
              </label>
              <label className="p-field">
                <span>Confirm new password</span>
                <input className="p-input" type={show ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
              </label>
              {msg && <div className={`p-alert ${msg.ok ? 'p-alert--ok' : 'p-alert--error'}`}>{msg.text}</div>}
              <button className="p-btn p-btn--grad p-btn--block" disabled={busy}>
                {busy ? 'Saving…' : 'Save new password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
