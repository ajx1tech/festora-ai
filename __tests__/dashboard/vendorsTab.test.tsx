import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { VendorsTab } from '@/components/dashboard/VendorsTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('VendorsTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  it('renders vendor progress summary and catalog cards', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <VendorsTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Vendor Contracts & Outreach/i)).toBeInTheDocument()
    expect(screen.getByText(/Committed Value/i)).toBeInTheDocument()
  })

  it('toggles collapsible interview questions for a vendor category', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <VendorsTab />
      </PlannerProvider>
    )

    const toggleBtn = screen.getAllByRole('button', { name: /Toggle vetting questions/i })[0]
    expect(screen.queryByText(/curfew timings/i)).not.toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.getByText(/curfew timings/i)).toBeInTheDocument()
  })

  it('updates vendor name and quote in store', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <VendorsTab />
      </PlannerProvider>
    )

    const nameInputs = screen.getAllByPlaceholderText(/Royal Palace Banquets/i)
    fireEvent.change(nameInputs[0], { target: { value: 'Grand Hyatt Pune' } })

    const quoteInputs = screen.getAllByPlaceholderText('0')
    fireEvent.change(quoteInputs[0], { target: { value: '750000' } })

    expect(nameInputs[0]).toHaveValue('Grand Hyatt Pune')
    expect(quoteInputs[0]).toHaveValue(750000)
  })

  it('changes vendor status to booked', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <VendorsTab />
      </PlannerProvider>
    )

    const selects = screen.getAllByLabelText(/Negotiation Status/i)
    fireEvent.change(selects[0], { target: { value: 'booked' } })

    expect(selects[0]).toHaveValue('booked')
  })

  it('opens vendor inquiry dialog when Draft Inquiry is clicked', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <VendorsTab />
      </PlannerProvider>
    )

    const draftBtns = screen.getAllByRole('button', { name: /Draft outreach inquiry/i })
    fireEvent.click(draftBtns[0])

    expect(screen.getByText(/Personalized inquiry crafted with your celebration dates/i)).toBeInTheDocument()
  })
})
