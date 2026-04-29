import type { FormEvent } from 'react'
import { business } from '../data/siteData'

export default function ContactPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.alert('Thank you! Your inquiry has been noted. We will contact you shortly.')
  }

  return (
    <main>
      <section className="section-headline">
        <h2>Contact Us</h2>
      </section>
      <section className="contact-grid">
        <article>
          <p><strong>Address:</strong> {business.address}</p>
          <p><strong>Phones:</strong> {business.phones.join(' / ')}</p>
          <p><strong>Landline:</strong> {business.landline}</p>
          <p><strong>Emails:</strong> {business.emails.join(' / ')}</p>
          <iframe
            title="Rainbow Colour Lab map"
            src="https://www.google.com/maps?q=21%20Naya%20Bazar%20Malviya%20Chowk%20Jabalpur%20Madhya%20Pradesh&output=embed"
            loading="lazy"
          ></iframe>
        </article>

        <form onSubmit={handleSubmit}>
          <h3>Quick Inquiry</h3>
          <input required type="text" placeholder="Name" />
          <input required type="tel" placeholder="Phone" />
          <input type="email" placeholder="Email" />
          <select defaultValue="">
            <option value="" disabled>Inquiry Type</option>
            <option>Photo Printing</option>
            <option>Custom Gifts</option>
            <option>Album Products</option>
            <option>Industrial B2B</option>
          </select>
          <textarea rows={4} placeholder="Tell us your requirement"></textarea>
          <button type="submit">Submit Inquiry</button>
        </form>
      </section>
    </main>
  )
}
