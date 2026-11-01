import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { OverviewTab } from '@/components/dashboard/OverviewTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/planner',
  useSearchParams: () => new URLSearchParams(),
}))

describe('OverviewTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  it('renders event details, countdown, and readiness score', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <OverviewTab />
      </PlannerProvider>
    )

    expect(screen.getByText(samples.wedding.name)).toBeInTheDocument()
    expect(screen.getByText(/Pune/i)).toBeInTheDocument()
    expect(screen.getByText(/250 guests/i)).toBeInTheDocument()
    expect(screen.getByText(/Days to Go/i)).toBeInTheDocument()
    expect(screen.getAllByText(/readiness/i).length).toBeGreaterThanOrEqual(1)
  })

  it('toggles task completion from next urgent milestones list', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <OverviewTab />
      </PlannerProvider>
    )

    const firstTask = weddingPlan.tasks[0]
    const checkbox = screen.getByLabelText(`Mark milestone completed: ${firstTask.title}`)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('calls onTabChange when alert action jump button is clicked', () => {
    const handleTabChange = jest.fn()

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <OverviewTab onTabChange={handleTabChange} />
      </PlannerProvider>
    )

    const fixButtons = screen.getAllByRole('button', { name: /jump to/i })
    expect(fixButtons.length).toBeGreaterThan(0)

    fireEvent.click(fixButtons[0])
    expect(handleTabChange).toHaveBeenCalled()
  })

  it('triggers calendar export download without throwing', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <OverviewTab />
      </PlannerProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /add to calendar/i })
    fireEvent.click(exportBtn)

    expect(URL.createObjectURL).toHaveBeenCalled()

    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })

  it('displays compressed schedule alert banner when event is within 30 days', () => {
    const nearDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const nearProfile = {
      ...samples.wedding,
      dateISO: nearDate,
    }
    const nearPlan = createPlanFromProfile(nearProfile, new Date())

    render(
      <PlannerProvider initialState={{ events: [nearPlan], activeEventId: nearPlan.id }}>
        <OverviewTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Compressed Planning Schedule/i)).toBeInTheDocument()
  })
})
