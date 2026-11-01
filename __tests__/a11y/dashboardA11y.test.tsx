import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { OverviewTab } from '@/components/dashboard/OverviewTab'
import { BudgetTab } from '@/components/dashboard/BudgetTab'
import { TimelineTab } from '@/components/dashboard/TimelineTab'
import { VendorsTab } from '@/components/dashboard/VendorsTab'
import { IdeasTab } from '@/components/ai/IdeasTab'
import { RunOfShowTab } from '@/components/ai/RunOfShowTab'
import { InvitationsTab } from '@/components/ai/InvitationsTab'
import { VendorMessageDialog } from '@/components/ai/VendorMessageDialog'
import { AskFestora } from '@/components/ai/AskFestora'
import { AiStatusBadge } from '@/components/ai/AiStatusBadge'
import { SampleDemo } from '@/components/dashboard/SampleDemo'
import PrintPlanPage from '@/app/planner/print/page'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/planner',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Dashboard and AI Tabs Accessibility Audit (jest-axe)', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  const wrap = (children: React.ReactNode) => (
    <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
      {children}
    </PlannerProvider>
  )

  it('OverviewTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<OverviewTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('BudgetTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<BudgetTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('TimelineTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<TimelineTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('VendorsTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<VendorsTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('IdeasTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<IdeasTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('RunOfShowTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<RunOfShowTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('InvitationsTab has zero accessibility violations', async () => {
    const { container } = render(wrap(<InvitationsTab />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('VendorMessageDialog has zero accessibility violations', async () => {
    const { container } = render(
      wrap(
        <VendorMessageDialog
          open={true}
          onOpenChange={jest.fn()}
          vendor={weddingPlan.vendors[0]}
          plan={weddingPlan}
        />
      )
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('AskFestora has zero accessibility violations', async () => {
    const { container } = render(wrap(<AskFestora />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('AiStatusBadge has zero accessibility violations', async () => {
    const { container } = render(<AiStatusBadge />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('SampleDemo has zero accessibility violations', async () => {
    const { container } = render(wrap(<SampleDemo />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PrintPlanPage has zero accessibility violations', async () => {
    const { container } = render(wrap(<PrintPlanPage />))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
