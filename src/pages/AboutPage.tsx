import { business, featuredLocalImages } from '../data/siteData'

export default function AboutPage() {
  return (
    <main>
      <section className="section-headline">
        <h2>About Rainbow Colour Lab</h2>
      </section>
      <section className="split">
        <img src={featuredLocalImages[2]} alt="Rainbow Colour Lab studio" loading="lazy" />
        <div>
          <p>
            Rainbow Colour Lab is a trusted family-run photo and printing business from Jabalpur with over {business.legacy} of service.
            Led by {business.proprietor}, we combine personal support with professional technology for retail and business clients.
          </p>
          <p><strong>GST:</strong> {business.gst}</p>
          <p><strong>IEC:</strong> {business.iec}</p>
        </div>
      </section>
    </main>
  )
}
