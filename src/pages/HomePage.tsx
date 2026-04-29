import { Link } from 'react-router-dom'
import { business, featuredLocalImages, serviceItems } from '../data/siteData'

export default function HomePage() {
  return (
    <main>
      <section className="hero hero-white">
        <div>
          <p className="eyebrow">Trusted since {business.established}</p>
          <h2>Premium photo printing and custom gifting, now in a cleaner modern experience.</h2>
          <p>Serving Jabalpur and all India with professional quality, fast dispatch, and 40+ years of family trust.</p>
          <div className="row">
            <Link className="btn solid" to="/services">Explore Services</Link>
            <Link className="btn" to="/contact">Get Quote</Link>
          </div>
        </div>
        <img src={featuredLocalImages[0]} alt="Rainbow Colour Lab work sample" />
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
        <img src={featuredLocalImages[3]} alt="Studio display" loading="lazy" />
        <div>
          <h3>Built for retail customers and industrial clients</h3>
          <p>From albums and gifts to HP Indigo machines and consumables, Rainbow Colour Lab supports both personal memories and business growth.</p>
          <Link className="btn solid" to="/industrial">View Industrial Section</Link>
        </div>
      </section>
    </main>
  )
}
