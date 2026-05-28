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
          <div className="footer-main">
            <p className="footer-brand">{business.brand}</p>
            <p className="footer-address">{business.address}</p>
            <p className="footer-contact-line">
              <a href="tel:+919425324286">{business.phones[0]}</a>
              <span aria-hidden="true"> · </span>
              <a href="tel:+917987627054">{business.phones[1]}</a>
              <span aria-hidden="true"> · </span>
              <a href={`mailto:${business.inquiryEmail}`}>{business.inquiryEmail}</a>
            </p>
          </div>
          <div className="footer-links-block">
            <p className="footer-links-title">Follow us</p>
            <ul className="footer-social-links">
              <li>
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link footer-social-link--instagram"
                >
                  Instagram @{business.instagram}
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919425324286"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link footer-social-link--whatsapp"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-meta">
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
        </div>
      </footer>

      <div className="sticky-actions">
        <a className="sticky-action sticky-action--call" href="tel:+919425324286">
          Call now
        </a>
        <a className="sticky-action sticky-action--whatsapp" href="https://wa.me/919425324286" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="sticky-action sticky-action--instagram" href={business.instagramUrl} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </div>
    </div>
    </LightboxProvider>
  )
}
