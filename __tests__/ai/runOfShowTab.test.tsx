import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RunOfShowTab } from '@/components/ai/RunOfShowTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('RunOfShowTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders accessible run-of-show schedule table and caption', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <RunOfShowTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Day-of Event Run of Show Schedule/i)).toBeInTheDocument()
    expect(screen.getByText(/Event Day Run of Show Schedule for/i)).toBeInTheDocument()
    expect(screen.getByText('08:00 AM')).toBeInTheDocument()
  })

  it('allows clicking a title to edit it inline and saves', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <RunOfShowTab />
      </PlannerProvider>
    )

    const titleBtn = screen.getAllByRole('button', { name: /Click to edit/i })[0]
    fireEvent.click(titleBtn)

    const input = screen.getByLabelText(/Edit title for/i)
    fireEvent.change(input, { target: { value: 'Bridal Party Hair & Makeup' } })

    const saveBtn = screen.getByRole('button', { name: /^Save$/i })
    fireEvent.click(saveBtn)

    expect(screen.getByText('Bridal Party Hair & Makeup')).toBeInTheDocument()
  })

  it('triggers window.print when print button is clicked', () => {
    const originalPrint = window.print
    window.print = jest.fn()

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <RunOfShowTab />
      </PlannerProvider>
    )

    const printBtn = screen.getByRole('button', { name: /Print/i })
    fireEvent.click(printBtn)

    expect(window.print).toHaveBeenCalled()
    window.print = originalPrint
  })

  it('regenerates schedule via /api/ai and displays Gemini attribution', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        data: {
          items: [
            {
              time: '08:00 AM',
              title: 'Mandap Vastu Pooja',
              detail: 'Officiant arrives to purify the wedding pavilion.',
            },
          ],
        },
      }),
    }) as jest.Mock

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <RunOfShowTab />
      </PlannerProvider>
    )

    const regenBtn = screen.getByRole('button', { name: /Regenerate/i })
    fireEvent.click(regenBtn)

    await waitFor(() => {
      expect(screen.getByText('Mandap Vastu Pooja')).toBeInTheDocument()
      expect(screen.getByText('Gemini')).toBeInTheDocument()
    })
  })
})
