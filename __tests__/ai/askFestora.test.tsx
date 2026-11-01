import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AskFestora } from '@/components/ai/AskFestora'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('AskFestora chat component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders chat message log with role log, aria-live, and privacy note', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <AskFestora />
      </PlannerProvider>
    )

    const log = screen.getByRole('log')
    expect(log).toBeInTheDocument()
    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(/Avoid sensitive personal data/i)).toBeInTheDocument()
    expect(screen.getByText(/0\/600/i)).toBeInTheDocument()
  })

  it('sends question from input, appends user bubble, and receives Gemini answer', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        data: {
          answer: 'Your budget is well-balanced across all 10 categories with a 10% contingency buffer.',
        },
      }),
    }) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <AskFestora />
      </PlannerProvider>
    )

    const input = screen.getByLabelText(/Message to Festora AI/i)
    fireEvent.change(input, { target: { value: 'How is my budget looking?' } })

    const sendBtn = screen.getByRole('button', { name: /Send message to Festora/i })
    fireEvent.click(sendBtn)

    expect(screen.getByText('How is my budget looking?')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Your budget is well-balanced across all 10 categories/i)).toBeInTheDocument()
      expect(screen.getAllByText('Gemini').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('clicking a starter suggestion chip sends the prompt immediately', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        data: {
          answer: 'You have 3 critical milestones due in the next 14 days.',
        },
      }),
    }) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <AskFestora />
      </PlannerProvider>
    )

    const chip = screen.getByRole('button', { name: /Am I over budget\?/i })
    fireEvent.click(chip)

    expect(screen.getAllByText('Am I over budget?').length).toBeGreaterThanOrEqual(1)

    await waitFor(() => {
      expect(screen.getByText(/You have 3 critical milestones/i)).toBeInTheDocument()
    })
  })

  it('handles 429 rate limit error gracefully and displays countdown cooldown', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('HTTP error 429: Rate limit exceeded')) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <AskFestora />
      </PlannerProvider>
    )

    const input = screen.getByLabelText(/Message to Festora AI/i)
    fireEvent.change(input, { target: { value: 'Quick check' } })

    const sendBtn = screen.getByRole('button', { name: /Send message to Festora/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(screen.getByText(/Rate limit cooling down/i)).toBeInTheDocument()
      expect(screen.getByText('Smart template')).toBeInTheDocument()
    })
  })
})
