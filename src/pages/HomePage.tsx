import { Link } from 'react-router-dom'
import { ZoomableImage } from '../components/ImageLightbox'
import {
  business,
  homeAdvertisementImages,
  homeAdvertisementVideoPosters,
  homeAdvertisementVideos,
  homeHeroCollage,
  homeHeroLogo,
  homeHighlights,
  homeSplitImage,
} from '../data/siteData'

const homeAdvertisementVideosMeta = [
  { title: 'LED frame', index: 0 },
  { title: 'Booklet frame', index: 1 },
  { title: 'Acrylic printing', index: 2 },
  { title: 'Magic mug', index: 3 },
] as const

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
            Photo lab, custom gifts, albums, enlargements, and machine sales, with vibrant quality and four decades of trust.
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
        <div className="hero-showcase">
          <figure className="hero-logo-card">
            <ZoomableImage src={homeHeroLogo} alt={`${business.brand} logo artwork`} loading="eager" />
          </figure>
          <div className="hero-collage hero-collage--six" aria-label="Featured products">
            {homeHeroCollage.map((src, index) => (
              <ZoomableImage key={src} src={src} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
        </div>
      </section>

      <section className="quick-grid">
        {homeHighlights.map((item) => (
          <Link key={item.title} to={item.to} className="quick-card">
            <article>
              <img src={item.image} alt="" loading="lazy" className="quick-card-image" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          </Link>
        ))}
      </section>

      <section className="home-offers">
        <div className="section-headline home-section-headline">
          <h2>Current Promotional Offers</h2>
          <p>
            These are our current promotional offers and featured deals running right now.
          </p>
        </div>
        <div className="home-offer-grid">
          {homeAdvertisementImages.map((src) => (
            <article key={src} className="home-offer-card">
              <ZoomableImage src={src} alt="" loading="lazy" />
            </article>
          ))}
        </div>
        <div className="home-video-grid">
          {homeAdvertisementVideosMeta.map(({ title, index }) => (
            <article key={title} className="home-video-card">
              <h4 className="home-video-subheading">{title}</h4>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={homeAdvertisementVideoPosters[index]}
              >
                <source src={`${homeAdvertisementVideos[index]}#t=0.001`} />
              </video>
            </article>
          ))}
        </div>
      </section>

      <section className="split home-industrial-spotlight">
        <ZoomableImage src={homeSplitImage} alt="Album and packaging from our lab" loading="lazy" />
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
