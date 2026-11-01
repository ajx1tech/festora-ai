import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IdeasTab } from '@/components/ai/IdeasTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('IdeasTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders concept statement, themes, idea cards, and privacy note', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <IdeasTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Creative Inspiration & Design Concepts/i)).toBeInTheDocument()
    expect(screen.getByText(/Celebration Concept/i)).toBeInTheDocument()
    expect(screen.getByText(/Curated Design Themes/i)).toBeInTheDocument()
    expect(screen.getByText(/Actionable Celebration Ideas/i)).toBeInTheDocument()
    expect(screen.getByText(/Avoid sensitive personal data/i)).toBeInTheDocument()
  })

  it('adds an idea to timeline as an AI-sourced task', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <IdeasTab />
      </PlannerProvider>
    )

    const addButtons = screen.getAllByRole('button', { name: /Add idea to plan/i })
    expect(addButtons.length).toBeGreaterThan(0)

    fireEvent.click(addButtons[0])
    expect(screen.getByText(/added to your celebration timeline/i)).toBeInTheDocument()
  })

  it('regenerates ideas with Gemini and shows SourceBadge Gemini', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        data: {
          concept: 'A majestic royal Maharashtrian vivah with gold marigold cascades.',
          themes: ['Royal Gold & Marigold', 'Contemporary Twilight', 'Heritage Terracotta'],
          ideas: [
            {
              title: 'Live Shenhai Ensemble',
              description: 'Welcoming guests with authentic live wind instrumentation.',
              estimatedCostBand: 'mid',
              category: 'music',
            },
          ],
          savingTips: ['Direct farm-to-table floral arrangements save 30%.'],
        },
      }),
    }) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <IdeasTab />
      </PlannerProvider>
    )

    const regenBtn = screen.getByRole('button', { name: /Regenerate/i })
    fireEvent.click(regenBtn)

    await waitFor(() => {
      expect(screen.getByText('Gemini')).toBeInTheDocument()
      expect(screen.getByText(/Live Shenhai Ensemble/i)).toBeInTheDocument()
    })

    // Cooldown button should now be disabled/cooling down
    expect(screen.getByText(/Cooldown/i)).toBeInTheDocument()
  })
})
