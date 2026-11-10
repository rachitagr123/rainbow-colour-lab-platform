import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { homeHeroLogo } from '../../data/siteData'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { session, profile, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && session && profile) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from !== '/admin/login' ? from : '/admin'} replace />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = await signIn(loginId, password)
    setBusy(false)
    if (err) setError(err)
    else navigate('/admin', { replace: true })
  }

  return (
    <div className="p-login">
      <form className="p-login__box" onSubmit={submit}>
        <div className="p-login__logo">
          <img src={homeHeroLogo} alt="Rainbow Colour Lab" />
        </div>
        <div className="p-card p-login__card">
          <h1>Album Desk</h1>
          <p className="p-login__sub">Sign in to enter and manage album orders</p>

          {error && <div className="p-alert p-alert--error">{error}</div>}

          <div className="p-grid">
            <label className="p-field">
              <span>Login ID</span>
              <input
                className="p-input"
                autoComplete="username"
                autoCapitalize="none"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. rcolourlab"
                required
                autoFocus
              />
            </label>
            <label className="p-field">
              <span>Password</span>
              <div className="p-pw">
                <input
                  className="p-input"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShow((s) => !s)}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>

          <button className="p-btn p-btn--grad p-btn--lg p-btn--block" disabled={busy} style={{ marginTop: '1.3rem' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="p-login__foot">Forgot password? Ask the admin to reset it.</p>
          <p className="p-login__foot">
            New staff member? <Link to="/admin/signup">Create an account</Link>
          </p>
        </div>
      </form>
    </div>
  )
}
