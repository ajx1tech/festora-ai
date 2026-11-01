import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BudgetTab } from '@/components/dashboard/BudgetTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('BudgetTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  it('renders summary metric cards and donut chart', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    expect(screen.getByText('Total Budget')).toBeInTheDocument()
    expect(screen.getByText('Total Spent')).toBeInTheDocument()
    expect(screen.getByText('Remaining Budget')).toBeInTheDocument()
    expect(screen.getByText('Cost Per Guest')).toBeInTheDocument()

    // Accessible screen-reader table fallback for donut chart
    expect(screen.getByText(/Budget distribution data table/i)).toBeInTheDocument()
  })

  it('allows inline editing of allocation and triggers rebalancing', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    const venueLine = weddingPlan.budget.find((b) => b.id === 'venue')!
    const editBtn = screen.getAllByRole('button', { name: /Click to edit/i })[0]

    fireEvent.click(editBtn)

    const input = screen.getByLabelText(`Edit allocation for ${venueLine.label}`)
    expect(input).toBeInTheDocument()

    fireEvent.change(input, { target: { value: '900000' } })
    const saveBtn = screen.getByRole('button', { name: /^Save$/i })
    fireEvent.click(saveBtn)

    // Check announcement
    expect(screen.getByText(/Updated allocation for category/i)).toBeInTheDocument()
  })

  it('toggles lock state on budget lines', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    const lockBtn = screen.getByLabelText(/Lock Venue/i)
    fireEvent.click(lockBtn)

    expect(screen.getByLabelText(/Unlock Venue/i)).toBeInTheDocument()
  })

  it('opens record expense dialog and adds a new expense entry', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    const openBtn = screen.getByRole('button', { name: /Record Expense/i })
    fireEvent.click(openBtn)

    expect(screen.getByText(/Record Celebration Expense/i)).toBeInTheDocument()

    const labelInput = screen.getByLabelText(/Description \/ Vendor Name/i)
    const amountInput = screen.getByLabelText(/Amount/i)

    fireEvent.change(labelInput, { target: { value: 'Advance Deposit' } })
    fireEvent.change(amountInput, { target: { value: '150000' } })

    const submitBtn = screen.getByRole('button', { name: /^Record Expense$/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Logged expense Advance Deposit/i)).toBeInTheDocument()
  })

  it('flags overspent categories with alert icon and text', () => {
    const overspentPlan = {
      ...weddingPlan,
      budget: weddingPlan.budget.map((b) =>
        b.id === 'venue' ? { ...b, spent: b.allocated + 50000 } : b
      ),
    }

    render(
      <PlannerProvider initialState={{ events: [overspentPlan], activeEventId: overspentPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Over by/i)).toBeInTheDocument()
  })

  it('adjusts sliders in what-if scenario and applies scenario to plan', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <BudgetTab />
      </PlannerProvider>
    )

    const applyBtn = screen.getByRole('button', { name: /Apply scenario to plan/i })
    fireEvent.click(applyBtn)

    expect(screen.getByText(/Applied scenario/i)).toBeInTheDocument()
  })
})
