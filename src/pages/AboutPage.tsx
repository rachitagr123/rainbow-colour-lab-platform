import { ZoomableImage } from '../components/ImageLightbox'
import { business, visitingCardImage } from '../data/siteData'

export default function AboutPage() {
  return (
    <main>
      <section className="section-headline">
        <h2>About {business.brand}</h2>
        <p>A full-service photo lab rooted in Jabalpur—with the reach and reliability of an all-India supplier.</p>
      </section>
      <section className="split about-split">
        <figure className="about-card-figure">
          <ZoomableImage src={visitingCardImage} alt={`${business.brand} visiting card`} loading="lazy" />
        </figure>
        <div className="about-copy">
          <p>
            <strong>{business.brand}</strong> has been part of Jabalpur&apos;s celebrations and businesses for generations. What began in
            the {business.established} as a trusted neighbourhood lab has grown into a modern printing destination—without losing the
            personal guidance customers expect from a family-run shop.
          </p>
          <p>
            <strong>{business.proprietor}</strong> and <strong>{business.coProprietor}</strong> built the lab&apos;s reputation on honest
            timelines, consistent colour, and careful finishing. From everyday reprints to full wedding album programmes, they ensured
            every order left the counter with pride—whether it was a single passport set or a studio&apos;s entire season of deliveries.
          </p>
          <p>
            The next chapter is led by <strong>Swarit Agrawal</strong> and <strong>Rachit Agrawal</strong>. Together they are refreshing the
            business for today&apos;s customers: clearer service menus, stronger digital presence, upgraded workflows for albums and
            enlargements, and closer coordination with photographers and corporate clients. The goal is simple—keep the warmth of a
            traditional lab while delivering the speed, variety, and polish people expect in 2026 and beyond.
          </p>
          <p>
            We still welcome walk-ins at Malviya Chowk, ship carefully when distance matters, and support fellow print labs with machine
            sales and supplies. If you value craft, clarity, and people who answer the phone, you are in the right place.
          </p>
          <ul className="about-facts">
            <li>
              <strong>GST:</strong> {business.gst}
            </li>
            <li>
              <strong>IEC:</strong> {business.iec}
            </li>
            <li>
              <strong>Studio:</strong> {business.address}
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
