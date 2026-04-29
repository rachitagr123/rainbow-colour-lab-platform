import { Link } from 'react-router-dom'
import { business, featuredLocalImages, serviceItems } from '../data/siteData'

export default function HomePage() {
  return (
    <main>
      <section className="hero premium-hero">
        <div>
          <p className="eyebrow">Trusted since {business.established}</p>
          <h2>{business.brand}</h2>
          <h3>Premium photo printing, custom gifting, and machine-focused print solutions.</h3>
          <p>Serving Jabalpur and all India with professional quality, fast dispatch, and 40+ years of family trust.</p>
          <div className="row">
            <Link className="btn solid" to="/services">Explore Services</Link>
            <Link className="btn" to="/contact">Get Quote</Link>
          </div>
        </div>
        <div className="hero-collage">
          <img src={featuredLocalImages[0]} alt="Rainbow Colour Lab premium work" />
          <img src={featuredLocalImages[1]} alt="Rainbow Colour Lab studio output" />
          <img src={featuredLocalImages[3]} alt="Rainbow Colour Lab display print" />
        </div>
      </section>

      <section className="quick-grid">
        {serviceItems.slice(0, 4).map((item) => (
          <article key={item.name}>
            <img src={item.image} alt={item.name} loading="lazy" />
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="split">
        <img src={featuredLocalImages[4]} alt="Studio display" loading="lazy" />
        <div>
          <h3>Built for retail customers and print businesses</h3>
          <p>From albums and gifts to machine sales and consumables, Rainbow Colour Lab supports both personal memories and business growth.</p>
          <Link className="btn solid" to="/industrial">View Machine Sales</Link>
        </div>
      </section>
    </main>
  )
}
