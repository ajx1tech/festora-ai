import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SampleDemo } from '@/components/dashboard/SampleDemo'
import { PlannerProvider } from '@/lib/store/plannerStore'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SampleDemo component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders all three ready-made celebration options', () => {
    render(
      <PlannerProvider>
        <SampleDemo />
      </PlannerProvider>
    )

    expect(screen.getByText(/Wedding Demo/i)).toBeInTheDocument()
    expect(screen.getByText(/Birthday Demo/i)).toBeInTheDocument()
    expect(screen.getByText(/Community Demo/i)).toBeInTheDocument()
  })

  it('loads sample wedding and redirects to planner', () => {
    render(
      <PlannerProvider>
        <SampleDemo />
      </PlannerProvider>
    )

    const weddingBtn = screen.getByLabelText(/Load sample Maharashtrian Wedding/i)
    fireEvent.click(weddingBtn)

    expect(mockPush).toHaveBeenCalledWith('/planner')
  })

  it('calls onLoaded callback if supplied instead of router.push', () => {
    const handleLoaded = jest.fn()
    render(
      <PlannerProvider>
        <SampleDemo onLoaded={handleLoaded} />
      </PlannerProvider>
    )

    const bdayBtn = screen.getByLabelText(/Load sample 30th Birthday Soiree/i)
    fireEvent.click(bdayBtn)

    expect(handleLoaded).toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
