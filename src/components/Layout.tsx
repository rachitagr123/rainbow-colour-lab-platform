import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LightboxProvider } from './ImageLightbox'
import { business } from '../data/siteData'

const year = new Date().getFullYear()

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <LightboxProvider>
    <div className={isHome ? 'shell' : 'shell inner-shell'}>
      <header className="site-header">
        <div>
          <p className="firm">{business.firmName}</p>
          <h1>{business.brand}</h1>
        </div>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/industrial">Machine sales</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <p className="footer-copy">
            © {year} {business.brand}. All rights reserved.
          </p>
          <p className="footer-credit">
            <span className="footer-credit-label">Website</span>
            <a href="mailto:rachitagr123@gmail.com" className="footer-credit-link">
              Rachit Agrawal
            </a>
          </p>
        </div>
      </footer>

      <div className="sticky-actions">
        <a href="tel:+919425324286">Call now</a>
        <a href="https://wa.me/919425324286" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </div>
    </LightboxProvider>
  )
}
