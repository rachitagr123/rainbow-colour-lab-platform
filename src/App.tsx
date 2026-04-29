import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type ServiceCategory =
  | 'Printing'
  | 'Custom Gifts'
  | 'Lamination & Framing'
  | 'Digital Restoration'
  | 'Album Products'
  | 'Industrial B2B'

type ServiceItem = {
  name: string
  category: ServiceCategory
  description: string
}

const business = {
  brand: 'Rainbow Colour Lab',
  firmName: 'RAINBOW COLOUR LAB',
  proprietor: 'Sushil Kumar Agrawal',
  established: '1980s',
  legacy: '40+ years',
  address: '21 Naya Bazar, Malviya Chowk, Jabalpur, Madhya Pradesh, India, 482001',
  phones: ['+91-9425324286', '+91-9425324287', '+91-9425801886'],
  landline: '07614082458',
  emails: ['rcolourlab123@gmail.com', 'rachitagr123@gmail.com'],
  gst: '23ACIPA1110D1ZS',
  iec: '1100000101',
}

const serviceItems: ServiceItem[] = [
  { name: 'All Types of Photo Printing', category: 'Printing', description: 'Premium prints in vivid color and accurate tones.' },
  { name: 'Marriage Album Printing', category: 'Printing', description: 'Luxury wedding album printing with lasting finish.' },
  { name: 'Photobook Printing', category: 'Printing', description: 'Story-driven photobooks for families and professionals.' },
  { name: 'HP Indigo Album Printing & Binding', category: 'Printing', description: 'Commercial-grade precision print and binding quality.' },
  { name: 'Mini Albums', category: 'Printing', description: 'Compact albums for gifts and event memories.' },
  { name: 'Corporate Printing', category: 'Printing', description: 'Brochures, branding collateral, and business prints.' },
  { name: 'Collage Printing', category: 'Printing', description: 'Creative multi-photo layouts for custom displays.' },
  { name: 'Enlargement Printing', category: 'Printing', description: 'Large format prints from 16x20 to 30x100.' },
  { name: 'Flex Printing', category: 'Printing', description: 'Durable flex solutions for campaigns and events.' },
  { name: 'Glass Printing', category: 'Printing', description: 'Elegant high-clarity prints on premium glass.' },
  { name: 'Acrylic Printing', category: 'Printing', description: 'Modern acrylic mounts for premium visual impact.' },
  { name: 'LED Frame Printing', category: 'Printing', description: 'Backlit photo displays for retail and decor spaces.' },
  { name: 'Backlight Printing', category: 'Printing', description: 'Illuminated signage and display-grade backlight prints.' },
  { name: 'Digital Printing (All Sizes)', category: 'Printing', description: 'Fast and accurate prints from 4x6 to 30x90.' },
  { name: 'Mug Printing', category: 'Custom Gifts', description: 'Personalized mugs for gifting and branding.' },
  { name: 'T-Shirt Printing', category: 'Custom Gifts', description: 'Custom apparel for events, brands, and personal use.' },
  { name: 'Pillow Printing', category: 'Custom Gifts', description: 'Photo pillows with vibrant and washable print.' },
  { name: 'Magic Cushion', category: 'Custom Gifts', description: 'Reveal-effect cushions for unique surprises.' },
  { name: 'Keyrings & Caps', category: 'Custom Gifts', description: 'High-volume personalized accessories.' },
  { name: 'Customized Gift Sets', category: 'Custom Gifts', description: 'Thoughtful combinations for celebrations and occasions.' },
  { name: 'All Lamination Types', category: 'Lamination & Framing', description: 'Protective lamination for long-term durability.' },
  { name: 'Custom Framing', category: 'Lamination & Framing', description: 'Frames from 1/2 inch to 8 inch and 8x12 to 20x24.' },
  { name: 'Premium Frame Designs', category: 'Lamination & Framing', description: 'Designer frame options for home and studio display.' },
  { name: 'Black & White to Color Restoration', category: 'Digital Restoration', description: 'Advanced recoloring for old heritage photographs.' },
  { name: 'Photo Mixing & Composites', category: 'Digital Restoration', description: 'Creative photo blending and memory edits.' },
  { name: 'Professional Editing Services', category: 'Digital Restoration', description: 'Retouching, correction, and enhancement workflows.' },
  { name: '2-Piece Acrylic Box', category: 'Album Products', description: 'Premium packaging solution for elite albums.' },
  { name: '3-Piece Box', category: 'Album Products', description: 'Strong and elegant protective album presentation.' },
  { name: '5-in-1 Combo', category: 'Album Products', description: 'Bundled album sets for wedding and event clients.' },
  { name: 'Piano Box', category: 'Album Products', description: 'Luxury piano finish packaging for signature deliveries.' },
  { name: 'Leather Boxes', category: 'Album Products', description: 'Classic textured leather cases for premium clients.' },
  { name: 'Wedding Combo Kits', category: 'Album Products', description: 'Complete wedding collection packaging and presentation.' },
  { name: 'HP Indigo Machine Sales (5500-12000)', category: 'Industrial B2B', description: 'Sourcing and consultation for Indigo presses.' },
  { name: 'Machine Spares & Consumables', category: 'Industrial B2B', description: 'Trusted spare parts, ink, blankets, and PIP supply.' },
  { name: 'Imetto Enlargement Machine Sales', category: 'Industrial B2B', description: 'Industrial enlargement systems for pro labs.' },
]

const testimonials = [
  {
    quote: 'Their print quality and delivery reliability have made them our default studio partner for years.',
    author: 'Wedding Photographer, Jabalpur',
  },
  {
    quote: 'From album boxes to custom gifts, everything arrives premium and exactly on time.',
    author: 'Event Planner, Madhya Pradesh',
  },
  {
    quote: 'Excellent support for B2B orders and machine consumables. Very professional team.',
    author: 'Print Business Owner, Central India',
  },
]

const gallery = [
  '/images/IMG-20250911-WA0021.jpg',
  '/images/IMG-20250911-WA0022.jpg',
  '/images/IMG-20260108-WA0014.jpg',
  '/images/IMG-20260314-WA0009.jpg',
  '/images/IMG-20260314-WA0010.jpg',
  '/images/IMG-20260428-WA0008.jpg',
  '/images/IMG-20260428-WA0011.jpg',
  '/images/IMG-20260428-WA0012.jpg',
  '/images/IMG-20260428-WA0014.jpg',
  '/images/IMG-20260428-WA0015.jpg',
  '/images/IMG-20260428-WA0020.jpg',
  '/images/IMG-20260428-WA0022.jpg',
]

const machineModels = ['HP Indigo 5500', 'HP Indigo 5600', 'HP Indigo 7500', 'HP Indigo 7600', 'HP Indigo 10000', 'HP Indigo 12000']

const categories: Array<ServiceCategory | 'All'> = ['All', 'Printing', 'Custom Gifts', 'Lamination & Framing', 'Digital Restoration', 'Album Products', 'Industrial B2B']

function App() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const isTestMode = import.meta.env.MODE === 'test'

  const filteredServices = useMemo(() => {
    return serviceItems.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory
      const text = `${item.name} ${item.description} ${item.category}`.toLowerCase()
      const queryMatch = text.includes(query.trim().toLowerCase())
      return categoryMatch && queryMatch
    })
  }, [query, selectedCategory])

  const handleInquirySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.alert('Thank you! Your inquiry has been noted. We will contact you shortly.')
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div>
          <p className="firm-name">{business.firmName}</p>
          <h1>{business.brand}</h1>
          <p className="tagline">Premium Photo Printing, Custom Gifting & Industrial Print Solutions</p>
        </div>
        <nav className="nav-links">
          <a href="#services">Services</a>
          <a href="#industrial">B2B Machines</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="chip">Trusted Family Business Since {business.established}</p>
            <h2>Colorful memories. Precision printing. Nationwide delivery.</h2>
            <p>
              Rainbow Colour Lab is a legacy photo studio and print business in Jabalpur, delivering premium visual products for families,
              photographers, and businesses across India.
            </p>
            <div className="cta-row">
              <a className="btn primary" href="tel:+919425324286">
                Call Now
              </a>
              <a className="btn secondary" href="https://wa.me/919425324286" target="_blank" rel="noreferrer">
                WhatsApp Inquiry
              </a>
            </div>
          </div>
          <div className="hero-highlight">
            <h3>Why Clients Choose Us</h3>
            <ul>
              <li>40+ years of trusted quality and service</li>
              <li>Retail + B2B solutions under one roof</li>
              <li>Fast turnaround with all-India delivery</li>
              <li>Advanced digital and HP Indigo workflows</li>
            </ul>
          </div>
        </section>

        <section className="legacy-grid" id="about">
          <article>
            <h3>About Us</h3>
            <p>
              Led by <strong>{business.proprietor}</strong>, our family-run studio has served generations in Jabalpur. We blend traditional trust with
              modern technology to create memorable products with consistent print excellence.
            </p>
          </article>
          <article>
            <h3>Certifications</h3>
            <p>
              <strong>GST:</strong> {business.gst}
              <br />
              <strong>IEC:</strong> {business.iec}
            </p>
          </article>
          <article>
            <h3>Delivery & Reach</h3>
            <p>From in-store custom orders to nationwide dispatch, we provide dependable fulfillment across India for both consumer and B2B demand.</p>
          </article>
        </section>

        <section id="services" className="section-block">
          <div className="section-head">
            <h3>Services & Products</h3>
            <p>Search and filter our service catalog to quickly find what you need.</p>
          </div>
          <div className="catalog-controls">
            <input
              type="search"
              value={query}
              placeholder="Search printing, gifting, framing, restoration, machines..."
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="chips-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={category === selectedCategory ? 'chip-btn active' : 'chip-btn'}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="service-grid">
            {filteredServices.map((item) => (
              <article className="service-card" key={item.name}>
                <p className="service-category">{item.category}</p>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="industrial" className="industrial">
          <div>
            <h3>HP Indigo & Industrial Solutions</h3>
            <p>
              Dedicated B2B support for machine sales, spare parts, consumables, and technical guidance. Built for photo labs, print factories,
              and commercial studios.
            </p>
            <ul>
              {machineModels.map((machine) => (
                <li key={machine}>{machine}</li>
              ))}
            </ul>
          </div>
          <div className="industrial-card">
            <h4>Industrial Supply Coverage</h4>
            <p>Ink, blankets, PIP, machine parts, and Imetto enlargement machine sales with responsive business support.</p>
            <a className="btn primary" href="mailto:rcolourlab123@gmail.com?subject=HP%20Indigo%20Inquiry">
              Request B2B Quote
            </a>
          </div>
        </section>

        <section id="gallery" className="section-block">
          <div className="section-head">
            <h3>Gallery & Portfolio Highlights</h3>
            <p>Showcase-ready visuals for retail display, social proof, and in-store catalog mode.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((image) => (
              <img key={image} src={image} alt="Rainbow Colour Lab sample work" loading="lazy" />
            ))}
          </div>
        </section>

        <section className="testimonials section-block">
          <div className="section-head">
            <h3>Customer Testimonials</h3>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <blockquote key={item.author}>
                “{item.quote}”<footer>{item.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="section-block faq">
          <div className="section-head">
            <h3>FAQ</h3>
          </div>
          <details>
            <summary>Do you deliver outside Jabalpur?</summary>
            <p>Yes. We provide delivery support across India for most products and B2B supply categories.</p>
          </details>
          <details>
            <summary>What print sizes are available?</summary>
            <p>Photo sizes range from 4x6 up to 30x90, including large-format enlargement printing.</p>
          </details>
          <details>
            <summary>Can businesses request bulk or machine inquiries?</summary>
            <p>Yes. Use the B2B inquiry options for machine sales, consumables, and wholesale print requirements.</p>
          </details>
        </section>

        <section className="future-ready section-block">
          <div className="section-head">
            <h3>Future-Ready Platform Architecture</h3>
          </div>
          <div className="future-grid">
            <p>Customer login/signup module placeholder</p>
            <p>Online ordering & instant print checkout placeholder</p>
            <p>Secure photo/file uploads placeholder</p>
            <p>Admin dashboard & inventory management placeholder</p>
            <p>Order tracking & CRM integration placeholder</p>
            <p>Franchise, dealer network, and vendor portal placeholder</p>
          </div>
        </section>

        <section id="contact" className="contact section-block">
          <div>
            <h3>Contact Us</h3>
            <p>
              <strong>Address:</strong> {business.address}
            </p>
            <p>
              <strong>Phones:</strong> {business.phones.join(' / ')}
            </p>
            <p>
              <strong>Landline:</strong> {business.landline}
            </p>
            <p>
              <strong>Emails:</strong> {business.emails.join(' / ')}
            </p>
            <div className="map-wrap">
              {isTestMode ? (
                <div aria-label="Rainbow Colour Lab map">Map preview disabled in tests</div>
              ) : (
                <iframe
                  title="Rainbow Colour Lab map"
                  src="https://www.google.com/maps?q=21%20Naya%20Bazar%20Malviya%20Chowk%20Jabalpur%20Madhya%20Pradesh&output=embed"
                  loading="lazy"
                ></iframe>
              )}
            </div>
          </div>
          <form onSubmit={handleInquirySubmit}>
            <h4>Quick Inquiry</h4>
            <input required type="text" placeholder="Name" />
            <input required type="tel" placeholder="Phone" />
            <input type="email" placeholder="Email" />
            <select defaultValue="">
              <option value="" disabled>
                Inquiry Type
              </option>
              <option>Photo Printing</option>
              <option>Custom Gifts</option>
              <option>Album Products</option>
              <option>Industrial B2B</option>
            </select>
            <textarea rows={4} placeholder="Tell us your requirement"></textarea>
            <button type="submit" className="btn primary">
              Submit Inquiry
            </button>
            <a className="btn secondary" href="#" onClick={(event) => event.preventDefault()}>
              Download Brochure (Placeholder)
            </a>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p>
          {business.brand} | {business.firmName} | Proprietor: {business.proprietor}
        </p>
        <p>Serving Jabalpur and all India with premium print, gifting, and industrial imaging solutions.</p>
      </footer>

      <div className="sticky-cta">
        <a href="tel:+919425324286">Call</a>
        <a href="https://wa.me/919425324286" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </div>
  )
}

export default App
