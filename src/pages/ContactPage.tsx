import type { FormEvent } from 'react'
import { useState } from 'react'
import { business } from '../data/siteData'

const web3AccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const contactPhones = [...business.phones, '+91-9425801886']
  const contactEmails = [...new Set([...business.emails, 'rachitagr123@gmail.com'])]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setStatus('idle')

    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const inquiryType = String(data.get('inquiry_type') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!web3AccessKey) {
      const body = encodeURIComponent(
        `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nType: ${inquiryType}\n\n${message}`,
      )
      window.location.href = `mailto:${business.inquiryEmail}?subject=${encodeURIComponent('Rainbow Colour Lab inquiry')}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3AccessKey,
          subject: 'Rainbow Colour Lab website inquiry',
          from_name: name,
          name,
          ...(email ? { email, replyto: email } : {}),
          phone,
          inquiry_type: inquiryType,
          message,
        }),
      })
      const json = (await res.json()) as { success?: boolean; message?: string }
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Send failed')
      }
      setStatus('ok')
      form.reset()
    } catch (e) {
      setStatus('err')
      setErrorMessage(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <main>
      <section className="section-headline">
        <h2>Contact us</h2>
        <p>
          Have a question or need a quote? Reach out by phone, WhatsApp, or the form below and we will get back to you
          as soon as we can.
        </p>
      </section>
      <section className="contact-grid">
        <article>
          <p>
            <strong>Address:</strong> {business.address}
          </p>
          <p>
            <strong>Phones:</strong> {contactPhones.join(' · ')}
          </p>
          <p>
            <strong>Landline:</strong> {business.landline}
          </p>
          <p>
            <strong>Email:</strong> {contactEmails.join(' · ')}
          </p>
          <p>
            <strong>Instagram:</strong>{' '}
            <a href={business.instagramUrl} target="_blank" rel="noreferrer">
              @{business.instagram}
            </a>
          </p>
          <iframe
            title="Rainbow Colour Lab map"
            src="https://www.google.com/maps?q=21%20Naya%20Bazar%20Malviya%20Chowk%20Jabalpur%20Madhya%20Pradesh&output=embed"
            loading="lazy"
          ></iframe>
        </article>

        <form data-testid="inquiry-form" className="inquiry-form" onSubmit={handleSubmit}>
          <h3>Quick inquiry</h3>
          {!web3AccessKey ? (
            <p className="form-note warn">
              <strong>Email form is in fallback mode:</strong> submit will open your mail app. For direct delivery, add{' '}
              <code>VITE_WEB3FORMS_ACCESS_KEY</code> from{' '}
              <a href="https://web3forms.com" target="_blank" rel="noreferrer">
                web3forms.com
              </a>
              .
            </p>
          ) : null}
          {status === 'ok' ? (
            <p className="form-note ok" role="status">
              Thank you, your message was sent. We will reply soon.
            </p>
          ) : null}
          {status === 'err' ? (
            <p className="form-note err" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <input required type="text" name="name" placeholder="Name" disabled={status === 'sending'} />
          <input required type="tel" name="phone" placeholder="Phone" disabled={status === 'sending'} />
          <input type="email" name="email" placeholder="Email (optional but recommended)" disabled={status === 'sending'} />
          <select required name="inquiry_type" defaultValue="" disabled={status === 'sending'}>
            <option value="" disabled>
              Inquiry type
            </option>
            <option>Photo printing</option>
            <option>Custom gifts</option>
            <option>Lamination &amp; framing</option>
            <option>Digital restoration</option>
            <option>Photobook &amp; album</option>
            <option>Acrylic printing</option>
            <option>Album bags</option>
            <option>Corporate printing</option>
            <option>Enlargement printing</option>
            <option>Glass / backlight printing</option>
            <option>Machine sales &amp; spares</option>
            <option>Other</option>
          </select>
          <textarea rows={4} name="message" placeholder="Tell us sizes, quantity, and deadline" required disabled={status === 'sending'} />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit inquiry'}
          </button>
        </form>
      </section>
    </main>
  )
}
