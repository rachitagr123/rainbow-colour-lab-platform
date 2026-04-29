import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { business } from '../data/siteData'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={isHome ? 'shell' : 'shell inner-shell'}>
      <header className="site-header">
        <div>
          <p className="firm">{business.firmName}</p>
          <h1>{business.brand}</h1>
        </div>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/industrial">Machine Sales</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>

      <Outlet />

      <div className="sticky-actions">
        <a href="tel:+919425324286">Call Now</a>
        <a href="https://wa.me/919425324286" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </div>
  )
}
