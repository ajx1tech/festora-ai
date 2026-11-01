import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InvitationsTab } from '@/components/ai/InvitationsTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('InvitationsTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders twin variants with proper HTML lang attributes', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <InvitationsTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Variant A/i)).toBeInTheDocument()
    expect(screen.getByText(/Variant B/i)).toBeInTheDocument()

    // Verify lang attribute on container
    const langContainers = document.querySelectorAll('[lang="en"]')
    expect(langContainers.length).toBeGreaterThan(0)
  })

  it('updates lang attribute when language is changed to Hindi', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <InvitationsTab />
      </PlannerProvider>
    )

    const langSelect = screen.getByLabelText(/Language/i)
    fireEvent.change(langSelect, { target: { value: 'Hindi' } })

    const hindiContainers = document.querySelectorAll('[lang="hi"]')
    expect(hindiContainers.length).toBeGreaterThan(0)
  })

  it('generates WhatsApp link with proper URI encoding', () => {
    const originalOpen = window.open
    window.open = jest.fn()

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <InvitationsTab />
      </PlannerProvider>
    )

    const whatsappButtons = screen.getAllByRole('button', { name: /WhatsApp/i })
    fireEvent.click(whatsappButtons[0])

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
      'noopener,noreferrer'
    )

    window.open = originalOpen
  })

  it('generates new variants with Gemini via /api/ai on submit', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        data: {
          variantA: {
            title: 'With Joy in Our Hearts',
            body: 'We invite you to witness the wedding vows of Rohan and Ananya.',
            rsvp: 'Kindly RSVP by August 15th to the Sharma Family.',
          },
          variantB: {
            title: 'Together with Our Families',
            body: 'Celebrate love and tradition at the Grand Hyatt Pune.',
            rsvp: 'RSVP via WhatsApp to +91 9876543210.',
          },
        },
      }),
    }) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <InvitationsTab />
      </PlannerProvider>
    )

    const generateBtn = screen.getByRole('button', { name: /Generate invitations/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(screen.getByText('With Joy in Our Hearts')).toBeInTheDocument()
      expect(screen.getByText('Together with Our Families')).toBeInTheDocument()
      expect(screen.getByText('Gemini')).toBeInTheDocument()
    })
  })
})
