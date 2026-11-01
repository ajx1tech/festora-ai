import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

const mockReplace = jest.fn()
let currentQueryTab: string | null = 'overview'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
  usePathname: () => '/planner',
  useSearchParams: () => ({
    get: (key: string) => (key === 'tab' ? currentQueryTab : null),
    toString: () => (currentQueryTab ? `tab=${currentQueryTab}` : ''),
  }),
}))

describe('DashboardTabs component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  beforeEach(() => {
    mockReplace.mockReset()
    currentQueryTab = 'overview'
  })

  it('renders all tab navigation triggers with desktop and mobile layouts', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <DashboardTabs />
      </PlannerProvider>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThanOrEqual(8)

    // Check presence of tab labels
    expect(screen.getAllByText('Overview').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Timeline').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Vendors').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Ideas & Themes').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Run of Show').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Invitations').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Ask Festora').length).toBeGreaterThanOrEqual(1)
  })

  it('triggers router.replace with new tab query on tab selection', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <DashboardTabs />
      </PlannerProvider>
    )

    const budgetTabBtn = screen.getAllByRole('tab', { name: /Budget/i })[0]
    fireEvent.pointerDown(budgetTabBtn, { pointerId: 1, button: 0 })
    fireEvent.click(budgetTabBtn)

    expect(mockReplace).toHaveBeenCalledWith('/planner?tab=budget', { scroll: false })
  })

  it('highlights the active tab according to query param', () => {
    currentQueryTab = 'timeline'

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <DashboardTabs />
      </PlannerProvider>
    )

    const timelineTabs = screen.getAllByRole('tab', { name: /Timeline/i })
    expect(timelineTabs[0]).toHaveAttribute('data-state', 'active')
  })
})
