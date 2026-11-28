import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Role } from './types'

const auth = vi.hoisted(() => ({
  loading: false,
  session: {},
  profile: { id: 'u1', username: 'tester', role: 'staff' as Role, approved: true, full_name: null },
  isAdmin: false,
  isOffice: false,
  signOut: async () => {},
}))

vi.mock('./auth', () => ({ useAuth: () => auth }))

const { default: PortalLayout, RequireAuth } = await import('./PortalLayout')

const as = (role: Role) => {
  auth.profile.role = role
  auth.isAdmin = role === 'admin'
  auth.isOffice = role === 'admin' || role === 'manager'
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<PortalLayout />}>
          <Route path="new" element={<p>order form</p>} />
          <Route path="orders" element={<p>orders page</p>} />
          <Route element={<RequireAuth officeOnly />}>
            <Route path="customers" element={<p>customers page</p>} />
          </Route>
          <Route element={<RequireAuth adminOnly />}>
            <Route path="users" element={<p>users page</p>} />
            <Route path="monthly" element={<p>monthly page</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  )

const sideLinks = () => Array.from(document.querySelectorAll('.p-side a'), (a) => a.textContent?.replace(/^\W+/u, '').trim())

describe('who sees which pages', () => {
  beforeEach(() => as('staff'))

  it('admin sees every page in the sidebar', () => {
    as('admin')
    renderAt('/admin/orders')
    expect(sideLinks()).toEqual(['Orders by date', 'New album order', 'Customers & rates', 'Users & passwords', 'Monthly summary'])
  })

  it('manager has no Users or Monthly summary link', () => {
    as('manager')
    renderAt('/admin/orders')
    expect(sideLinks()).toEqual(['Orders by date', 'New album order', 'Customers & rates'])
  })

  it('staff get no sidebar at all', () => {
    renderAt('/admin/new')
    expect(document.querySelector('.p-side')).toBeNull()
  })

  it.each([
    ['admin', '/admin/monthly', 'monthly page'],
    ['admin', '/admin/users', 'users page'],
    ['manager', '/admin/customers', 'customers page'],
    ['manager', '/admin/monthly', 'order form'],
    ['manager', '/admin/users', 'order form'],
    ['staff', '/admin/customers', 'order form'],
    ['staff', '/admin/monthly', 'order form'],
  ] as const)('%s opening %s sees the %s', (role, path, page) => {
    as(role)
    renderAt(path)
    expect(screen.getByText(page)).toBeInTheDocument()
  })
})
