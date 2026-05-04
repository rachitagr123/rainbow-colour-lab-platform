import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LightboxProvider } from './components/ImageLightbox'
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'

const renderServices = () =>
  render(
    <MemoryRouter>
      <LightboxProvider>
        <ServicesPage />
      </LightboxProvider>
    </MemoryRouter>,
  )

describe('Interactive pages', () => {
  it('filters services by category', async () => {
    const user = userEvent.setup()
    renderServices()

    await user.click(screen.getByRole('button', { name: 'Custom Gifts' }))

    expect(document.getElementById('custom-gifts')).not.toBeNull()
    expect(screen.getByText(/Mug printing/i)).toBeInTheDocument()
    expect(document.getElementById('photo-printing')).toBeNull()
  })

  it('searches services by keyword', async () => {
    const user = userEvent.setup()
    renderServices()

    await user.type(screen.getByPlaceholderText(/search/i), 'restoration')

    expect(document.getElementById('digital-restoration')).not.toBeNull()
  })

  it('renders inquiry form', () => {
    render(<ContactPage />)

    expect(screen.getByTestId('inquiry-form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit inquiry/i })).toBeInTheDocument()
  })
})
