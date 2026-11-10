import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import PortalLayout, { RequireAuth } from './PortalLayout'
import CustomersPage from './pages/CustomersPage'
import LoginPage from './pages/LoginPage'
import MonthlyPage from './pages/MonthlyPage'
import NewOrderPage from './pages/NewOrderPage'
import OrderPage from './pages/OrderPage'
import OrdersPage from './pages/OrdersPage'
import PrintDayPage from './pages/PrintDayPage'
import SignupPage from './pages/SignupPage'
import UsersPage from './pages/UsersPage'
import { supabaseConfigured } from './supabase'
import './portal.css'

function HomeRedirect() {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/admin/orders' : '/admin/new'} replace />
}

export default function PortalApp() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const prevTitle = document.title
    document.title = 'Album Desk · Rainbow Colour Lab'
    return () => {
      meta.remove()
      document.title = prevTitle
    }
  }, [])

  if (!supabaseConfigured) {
    return (
      <div className="portal">
        <div className="p-loading">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.
        </div>
      </div>
    )
  }

  return (
    <div className="portal">
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<PortalLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route path="new" element={<NewOrderPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderNo" element={<OrderPage />} />
              <Route element={<RequireAuth adminOnly />}>
                <Route path="customers" element={<CustomersPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="monthly" element={<MonthlyPage />} />
              </Route>
            </Route>
            <Route element={<RequireAuth adminOnly />}>
              <Route path="print/:date" element={<PrintDayPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}
