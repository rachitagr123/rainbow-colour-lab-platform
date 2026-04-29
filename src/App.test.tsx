import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'

describe('Interactive pages', () => {
  it('filters services by category', async () => {
    const user = userEvent.setup()
    render(<ServicesPage />)

    await user.click(screen.getByRole('button', { name: 'Custom Gifts' }))

    expect(screen.getByText('Mug Printing')).toBeInTheDocument()
    expect(screen.queryByText('All Types of Photo Printing')).not.toBeInTheDocument()
  })

  it('searches services by keyword', async () => {
    const user = userEvent.setup()
    render(<ServicesPage />)

    await user.type(screen.getByPlaceholderText(/search services/i), 'restoration')

    expect(screen.getByText('Black & White to Color Restoration')).toBeInTheDocument()
  })

  it('submits inquiry form and shows confirmation alert', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert')

    render(<ContactPage />)

    await user.type(screen.getByPlaceholderText('Name'), 'Test User')
    await user.type(screen.getByPlaceholderText('Phone'), '9999999999')
    await user.click(screen.getByRole('button', { name: 'Submit Inquiry' }))

    expect(alertSpy).toHaveBeenCalledWith('Thank you! Your inquiry has been noted. We will contact you shortly.')
    alertSpy.mockClear()
  })
})
