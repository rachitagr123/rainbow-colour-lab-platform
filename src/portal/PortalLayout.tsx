import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { homeHeroLogo } from '../data/siteData'
import { useAuth } from './auth'

export function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const { loading, session, profile, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-loading">Loading…</div>
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!profile) {
    return (
      <div className="p-loading">
        This login has no Album Desk role yet. Ask the admin to run the setup script, then sign in again.
      </div>
    )
  }
  if (!profile.approved) return <PendingApproval />
  if (adminOnly && !isAdmin) return <Navigate to="/admin/new" replace />
  return <Outlet />
}

function PendingApproval() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="p-login">
      <div className="p-login__box">
        <div className="p-card p-login__card p-pending">
          <div className="p-pending__icon">⏳</div>
          <h1>Waiting for approval</h1>
          <p className="p-login__sub">
            Hi {profile?.full_name || profile?.username}, your account <b>{profile?.username}</b> has been created. The admin needs to approve it
            before you can enter orders. Please check again later.
          </p>
          <div className="p-grid p-g2">
            <button type="button" className="p-btn" onClick={() => window.location.reload()}>
              Check again
            </button>
            <button
              type="button"
              className="p-btn p-btn--grad"
              onClick={async () => {
                await signOut()
                navigate('/admin/login', { replace: true })
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PortalLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const initials = (profile?.username ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="p-app">
      <header className="p-topbar no-print">
        <div className="p-topbar__inner">
          <NavLink to="/admin" className="p-brand">
            <img src={homeHeroLogo} alt="" />
            <div>
              <b>Album Desk</b>
              <span>{isAdmin ? 'Admin panel' : 'Indigo Album (Collection)'}</span>
            </div>
          </NavLink>
          <div className="p-topbar__right">
            {!isAdmin && (
              <>
                <NavLink className="p-btn p-btn--sm" to="/admin/new">
                  + New order
                </NavLink>
                <NavLink className="p-btn p-btn--sm" to="/admin/orders">
                  Today&apos;s orders
                </NavLink>
              </>
            )}
            <div className="p-user">
              <i>{initials}</i>
              {profile?.username}
              <span className={`p-role${isAdmin ? ' p-role--admin' : ''}`}>{isAdmin ? 'Admin' : 'Staff'}</span>
            </div>
            <button type="button" className="p-btn p-btn--sm" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {isAdmin ? (
        <div className="p-shell">
          <nav className="p-side no-print">
            <div className="p-side__label">Albums</div>
            <NavLink to="/admin/orders">
              <i>📋</i>Orders by date
            </NavLink>
            <NavLink to="/admin/new">
              <i>＋</i>New album order
            </NavLink>
            <div className="p-side__label">Setup</div>
            <NavLink to="/admin/customers">
              <i>👥</i>Customers &amp; rates
            </NavLink>
            <NavLink to="/admin/users">
              <i>🔑</i>Users &amp; passwords
            </NavLink>
            <div className="p-side__label">Reports</div>
            <NavLink to="/admin/monthly">
              <i>📈</i>Monthly summary
            </NavLink>
          </nav>
          <main className="p-page">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="p-page p-page--narrow">
          <Outlet />
        </main>
      )}
    </div>
  )
}
