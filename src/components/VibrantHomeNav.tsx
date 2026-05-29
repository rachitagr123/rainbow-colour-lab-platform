import { NavLink } from 'react-router-dom'
import { business, homeHeroLogo } from '../data/siteData'

export default function VibrantHomeNav() {
  return (
    <header className="vibrant-hero__nav">
      <div className="vibrant-hero__brand">
        <img src={homeHeroLogo} alt={business.brand} />
        <span>{business.brand}</span>
      </div>
      <nav className="vibrant-hero__links" aria-label="Main">
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
  )
}
