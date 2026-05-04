import { Link } from 'react-router-dom'
import { business, homeHeroCollage, homeHighlights, homeSplitImage } from '../data/siteData'

export default function HomePage() {
  return (
    <main>
      <section className="hero premium-hero">
        <div>
          <p className="eyebrow">Jabalpur · Serving customers across India</p>
          <h2 className="hero-brand">
            <span className="hero-brand-muted">Welcome to</span>
            <span className="hero-brand-rainbow">{business.brand}</span>
          </h2>
          <h3 className="hero-tagline">
            Photo lab, custom gifts, albums, enlargements, and machine sales — vibrant quality with four decades of trust.
          </h3>
          <p className="hero-lead">
            Your memories and your brand deserve crisp colour and careful finishing. From wallet prints to wall-sized enlargements,
            we combine modern equipment with hands-on guidance at our Malviya Chowk studio.
          </p>
          <div className="row">
            <Link className="btn solid" to="/services">
              Explore services
            </Link>
            <Link className="btn" to="/contact">
              Get a quote
            </Link>
          </div>
        </div>
        <div className="hero-collage hero-collage--six" aria-hidden="true">
          {homeHeroCollage.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      </section>

      <section className="quick-grid">
        {homeHighlights.map((item) => (
          <Link key={item.title} to={item.to} className="quick-card">
            <article>
              <img src={item.image} alt="" loading="lazy" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          </Link>
        ))}
      </section>

      <section className="split">
        <img src={homeSplitImage} alt="Album and packaging from our lab" loading="lazy" />
        <div>
          <h3>Retail, weddings, and print businesses</h3>
          <p>
            Families walk in for prints and gifts; photographers rely on us for albums, boxes, and enlargements. Print businesses
            partner with us for HP Indigo lines, consumables, and the Imetto systems used for large-format work.
          </p>
          <Link className="btn solid" to="/industrial">
            Machine sales &amp; spares
          </Link>
        </div>
      </section>
    </main>
  )
}
