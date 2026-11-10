import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homeHeroLogo } from '../../data/siteData'
import { useAuth } from '../auth'
import { errorMessage, supabase } from '../supabase'

export default function SignupPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '', loginId: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) return setError('The two passwords do not match.')
    setBusy(true)
    const { error: err } = await supabase.rpc('sign_up_staff', {
      p_username: form.loginId,
      p_password: form.password,
      p_full_name: form.fullName,
      p_phone: form.phone,
    })
    setBusy(false)
    if (err) return setError(errorMessage(err))
    setDone(true)
  }

  return (
    <div className="p-login">
      <div className="p-login__box">
        <div className="p-login__logo">
          <img src={homeHeroLogo} alt="Rainbow Colour Lab" />
        </div>

        {done ? (
          <div className="p-card p-login__card p-pending">
            <div className="p-pending__icon">✓</div>
            <h1>Account created</h1>
            <p className="p-login__sub">
              Your login ID is <b>{form.loginId.trim().toLowerCase()}</b>. The admin needs to approve your account before you can enter
              orders.
            </p>
            <button
              type="button"
              className="p-btn p-btn--grad p-btn--lg p-btn--block"
              onClick={async () => {
                const err = await signIn(form.loginId, form.password)
                if (err) setError(err)
                navigate('/admin', { replace: true })
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <form className="p-card p-login__card" onSubmit={submit}>
            <h1>Create staff account</h1>
            <p className="p-login__sub">For Rainbow Colour Lab staff. The admin approves new accounts.</p>

            {error && <div className="p-alert p-alert--error">{error}</div>}

            <div className="p-grid">
              <label className="p-field">
                <span>Your name</span>
                <input className="p-input" value={form.fullName} onChange={set('fullName')} required autoFocus autoComplete="name" />
              </label>
              <label className="p-field">
                <span>
                  Mobile number <small>· optional</small>
                </span>
                <input className="p-input" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </label>
              <label className="p-field">
                <span>
                  Login ID <small>· letters and numbers, no spaces</small>
                </span>
                <input
                  className="p-input"
                  value={form.loginId}
                  onChange={set('loginId')}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9][A-Za-z0-9._\-]{2,29}"
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="e.g. ramesh"
                />
              </label>
              <label className="p-field">
                <span>Password</span>
                <div className="p-pw">
                  <input
                    className="p-input"
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShow((s) => !s)}>
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <label className="p-field">
                <span>Confirm password</span>
                <input
                  className="p-input"
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>
            </div>

            <button className="p-btn p-btn--grad p-btn--lg p-btn--block" disabled={busy} style={{ marginTop: '1.3rem' }}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
            <p className="p-login__foot">
              Already have an account? <Link to="/admin/login">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
