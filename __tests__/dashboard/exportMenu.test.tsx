import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportMenu } from '@/components/dashboard/ExportMenu'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('ExportMenu component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()
  })

  it('toggles export dropdown menu', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <ExportMenu />
      </PlannerProvider>
    )

    const menuBtn = screen.getByRole('button', { name: /Export or backup celebration plan/i })
    expect(screen.queryByText(/Export JSON Blueprint/i)).not.toBeInTheDocument()

    fireEvent.click(menuBtn)
    expect(screen.getByText(/Export JSON Blueprint/i)).toBeInTheDocument()
    expect(screen.getByText(/Calendar \(\.ics\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Print \/ Save PDF/i)).toBeInTheDocument()
    expect(screen.getByText(/Import JSON Blueprint/i)).toBeInTheDocument()
  })

  it('triggers calendar (.ics) blob download', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <ExportMenu />
      </PlannerProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Export or backup celebration plan/i }))
    const icsBtn = screen.getByRole('menuitem', { name: /Calendar \(\.ics\)/i })

    fireEvent.click(icsBtn)
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('triggers plan JSON blob download', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <ExportMenu />
      </PlannerProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Export or backup celebration plan/i }))
    const jsonBtn = screen.getByRole('menuitem', { name: /Export JSON Blueprint/i })

    fireEvent.click(jsonBtn)
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
