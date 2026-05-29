import { NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { LightboxProvider } from './ImageLightbox'
import VibrantHomeNav from './VibrantHomeNav'
import { isVibrantLayoutPreview } from '../config/layoutPreview'
import { business } from '../data/siteData'

const year = new Date().getFullYear()

export default function Layout() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isHome = location.pathname === '/'
  const vibrantPreview = isVibrantLayoutPreview(searchParams)
  const shellClass = vibrantPreview
    ? 'shell vibrant-preview'
    : isHome
      ? 'shell'
      : 'shell inner-shell'

  const pageContent =
    vibrantPreview && !isHome ? (
      <div className="vibrant-inner-shell">
        <div className="vibrant-inner-shell__band">
          <div className="vibrant-inner-shell__backdrop" aria-hidden="true" />
          <div className="vibrant-inner-shell__band-inner">
            <VibrantHomeNav />
          </div>
        </div>
        <div className="vibrant-inner-shell__body">
          <Outlet />
        </div>
      </div>
    ) : (
      <Outlet />
    )

  return (
    <LightboxProvider>
    <div className={shellClass}>
      {vibrantPreview ? null : (
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
      )}

      {pageContent}

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
