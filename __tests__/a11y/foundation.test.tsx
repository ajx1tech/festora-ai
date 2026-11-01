import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'
import Home from '@/app/page'

describe('Foundation smoke test', () => {
  it('renders home page with main content landmark', () => {
    const { getByRole } = render(<Home />)
    const main = getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Home />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
