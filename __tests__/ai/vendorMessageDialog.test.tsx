import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VendorMessageDialog } from '@/components/ai/VendorMessageDialog'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('VendorMessageDialog component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)
  const targetVendor = weddingPlan.vendors[0]
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders vendor dialog with initial template content and privacy note', () => {
    render(
      <VendorMessageDialog
        open={true}
        onOpenChange={jest.fn()}
        vendor={targetVendor}
        plan={weddingPlan}
      />
    )

    expect(screen.getByText(new RegExp(`Draft Outreach: ${targetVendor.name}`, 'i'))).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message Body/i)).toBeInTheDocument()
    expect(screen.getByText(/Avoid sensitive personal data/i)).toBeInTheDocument()
    expect(screen.getByText('Smart template')).toBeInTheDocument()
  })

  it('allows editing message textarea body', () => {
    render(
      <VendorMessageDialog
        open={true}
        onOpenChange={jest.fn()}
        vendor={targetVendor}
        plan={weddingPlan}
      />
    )

    const textarea = screen.getByLabelText(/Message Body/i)
    fireEvent.change(textarea, { target: { value: 'Inquiring about wedding dates for December.' } })

    expect(textarea).toHaveValue('Inquiring about wedding dates for December.')
  })

  it('shares message via WhatsApp with encoded text', () => {
    const originalOpen = window.open
    window.open = jest.fn()

    render(
      <VendorMessageDialog
        open={true}
        onOpenChange={jest.fn()}
        vendor={targetVendor}
        plan={weddingPlan}
      />
    )

    const waBtn = screen.getByRole('button', { name: /WhatsApp/i })
    fireEvent.click(waBtn)

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
      'noopener,noreferrer'
    )

    window.open = originalOpen
  })

  it('regenerates message with Gemini via /api/ai', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        data: {
          subject: 'Wedding Inquiry: December Dates for 250 Guests',
          message: 'Hello, we are planning a wedding reception and would love to review your packages.',
        },
      }),
    }) as jest.Mock

    render(
      <VendorMessageDialog
        open={true}
        onOpenChange={jest.fn()}
        vendor={targetVendor}
        plan={weddingPlan}
      />
    )

    const regenBtn = screen.getByRole('button', { name: /Regenerate/i })
    fireEvent.click(regenBtn)

    await waitFor(() => {
      expect(screen.getByText('Gemini')).toBeInTheDocument()
      expect(screen.getByDisplayValue(/Wedding Inquiry: December Dates/i)).toBeInTheDocument()
    })
  })
})
