import Home from '@/app/page'
import PlannerLayout from '@/app/planner/layout'
import { Step1Basics } from '@/components/wizard/Step1Basics'
import { Step2GuestsBudget } from '@/components/wizard/Step2GuestsBudget'
import { Step3StylePreferences } from '@/components/wizard/Step3StylePreferences'
import { Step4Review } from '@/components/wizard/Step4Review'
import { createSampleProfiles } from '@/lib/engines/sampleData'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/planner',
  useSearchParams: () => ({ get: () => null }),
}))

describe('Accessibility audit with jest-axe', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)

  it('Landing Page has no accessibility violations', async () => {
    const { container } = render(
      <PlannerProvider>
        <Home />
      </PlannerProvider>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Wizard Step 1 (Basics) has no accessibility violations', async () => {
    const { container } = render(
      <Step1Basics
        data={{
          type: 'wedding',
          name: "Ananya & Rohan's Wedding",
          dateISO: '2026-10-15',
          city: 'Pune',
        }}
        onChange={jest.fn()}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Wizard Step 2 (Guests & Budget) has no accessibility violations', async () => {
    const { container } = render(
      <Step2GuestsBudget
        data={{
          guests: 200,
          currency: 'INR',
          budgetTotal: 2000000,
        }}
        eventType="wedding"
        onChange={jest.fn()}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Wizard Step 3 (Style & Preferences) has no accessibility violations', async () => {
    const { container } = render(
      <Step3StylePreferences
        data={{
          vibes: ['Royal Traditional', 'Floral & Botanical'],
          dietary: ['Vegetarian', 'Jain'],
          venueType: 'indoor',
          priorities: ['venue', 'catering'],
          traditions: 'Traditional Maharashtrian rituals',
        }}
        eventType="wedding"
        onChange={jest.fn()}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Wizard Step 4 (Review) has no accessibility violations', async () => {
    const { container } = render(
      <Step4Review profile={samples.wedding} onSubmit={jest.fn()} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Planner Shell Layout has no accessibility violations', async () => {
    const { container } = render(
      <PlannerProvider>
        <PlannerLayout>
          <div>Planner Content</div>
        </PlannerLayout>
      </PlannerProvider>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
