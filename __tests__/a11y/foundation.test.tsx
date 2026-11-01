import Home from '@/app/page'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'

describe('Foundation smoke test', () => {
  it('renders home page with main content landmark', () => {
    const { getByRole } = render(
      <PlannerProvider>
        <Home />
      </PlannerProvider>
    )
    const main = getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PlannerProvider>
        <Home />
      </PlannerProvider>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
