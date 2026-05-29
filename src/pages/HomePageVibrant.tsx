import { Link } from 'react-router-dom'
import VibrantHomeNav from '../components/VibrantHomeNav'
import { ZoomableImage } from '../components/ImageLightbox'
import {
  business,
  homeAdvertisementImages,
  homeAdvertisementVideoPosters,
  homeAdvertisementVideos,
  homeHeroCollage,
  homeHighlights,
  homeSplitImage,
} from '../data/siteData'

const homeAdvertisementVideosMeta = [
  { title: 'LED frame', index: 0 },
  { title: 'Booklet frame', index: 1 },
  { title: 'Acrylic printing', index: 2 },
  { title: 'Magic mug', index: 3 },
] as const

export default function HomePageVibrant() {
  return (
    <main className="vibrant-home">
      <section className="vibrant-hero">
        <div className="vibrant-hero__backdrop" aria-hidden="true" />

        <div className="vibrant-hero__inner">
          <VibrantHomeNav />

          <div className="vibrant-hero__copy">
            <p className="vibrant-hero__eyebrow">Jabalpur · {business.legacy} of trusted printing</p>
            <h1 className="vibrant-hero__title">{business.firmName}</h1>
            <p className="vibrant-hero__subtitle">
              Photo lab, custom gifts, albums, enlargements &amp; machine sales — vibrant quality with hands-on guidance.
            </p>
            <Link className="vibrant-hero__cta" to="/services">
              Explore services
            </Link>
          </div>

          <div className="vibrant-hero__showcase" aria-label="Featured products">
            {homeHeroCollage.map((src, index) => (
              <figure key={src} className="vibrant-hero__product">
                <ZoomableImage src={src} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="vibrant-cards-grid">
        {homeHighlights.map((item) => (
          <Link key={item.title} to={item.to} className="vibrant-card-link">
            <article className="vibrant-card">
              <img src={item.image} alt="" loading="lazy" className="vibrant-card__img" />
              <div className="vibrant-card__body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          </Link>
        ))}
      </section>

      <section className="vibrant-section">
        <header className="vibrant-section__head">
          <h2>Current promotional offers</h2>
          <p>Featured deals running right now at Rainbow Colour Lab.</p>
        </header>
        <div className="vibrant-offers-row">
          {homeAdvertisementImages.map((src) => (
            <article key={src} className="vibrant-offer-tile">
              <ZoomableImage src={src} alt="" loading="lazy" />
            </article>
          ))}
        </div>
        <div className="vibrant-video-row">
          {homeAdvertisementVideosMeta.map(({ title, index }) => (
            <article key={title} className="vibrant-video-tile">
              <h4>{title}</h4>
              <video autoPlay loop muted playsInline preload="metadata" poster={homeAdvertisementVideoPosters[index]}>
                <source src={`${homeAdvertisementVideos[index]}#t=0.001`} />
              </video>
            </article>
          ))}
        </div>
      </section>

      <section className="vibrant-section vibrant-section--split">
        <figure className="vibrant-split__media">
          <ZoomableImage src={homeSplitImage} alt="Machines and lab services" loading="lazy" />
        </figure>
        <div className="vibrant-split__copy">
          <h3>Retail, weddings &amp; print businesses</h3>
          <p>
            Families walk in for prints and gifts; photographers rely on us for albums and enlargements. Print businesses
            partner with us for HP Indigo lines and large-format systems.
          </p>
          <Link className="vibrant-hero__cta vibrant-hero__cta--small" to="/industrial">
            Machine sales
          </Link>
        </div>
      </section>
    </main>
  )
}
