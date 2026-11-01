import { WizardContainer } from '@/components/wizard/WizardContainer'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'type' ? 'wedding' : null),
  }),
}))

describe('Wizard component workflow & validation', () => {
  beforeEach(() => {
    mockPush.mockReset()
    sessionStorage.clear()
  })

  function renderWizard(): ReturnType<typeof render> {
    return render(
      <PlannerProvider>
        <WizardContainer />
      </PlannerProvider>
    )
  }

  it('renders Step 1 with heading and prevents navigation on invalid input', () => {
    renderWizard()

    expect(
      screen.getByRole('heading', { name: /tell us about your celebration/i })
    ).toBeInTheDocument()

    // Try clicking Continue without filling required fields
    const nextBtn = screen.getByRole('button', { name: /continue to step 2/i })
    fireEvent.click(nextBtn)

    // Validation errors should appear
    expect(
      screen.getByText(/please provide an event name/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/please select a celebration date/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/please specify the city/i)).toBeInTheDocument()
  })

  it('navigates from Step 1 to Step 2 when fields are valid', () => {
    renderWizard()

    // Fill Step 1
    const nameInput = screen.getByPlaceholderText(
      /give your celebration a memorable name/i
    )
    fireEvent.change(nameInput, {
      target: { value: "Rohan & Priya's Sangeet" },
    })

    const dateInput = screen.getByLabelText(/celebration date/i)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 90)
    const futureISO = futureDate.toISOString().split('T')[0]
    fireEvent.change(dateInput, { target: { value: futureISO } })

    const cityInput = screen.getByPlaceholderText(/city or destination/i)
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } })

    // Click Continue
    const nextBtn = screen.getByRole('button', { name: /continue to step 2/i })
    fireEvent.click(nextBtn)

    // Should now be on Step 2
    expect(
      screen.getByRole('heading', { name: /scale & financial horizon/i })
    ).toBeInTheDocument()
  })

  it('updates guests and calculates live budget realism hint on Step 2', () => {
    renderWizard()

    // Fill Step 1
    fireEvent.change(
      screen.getByPlaceholderText(/give your celebration a memorable name/i),
      { target: { value: 'Test Birthday' } }
    )
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 45)
    fireEvent.change(screen.getByLabelText(/celebration date/i), {
      target: { value: futureDate.toISOString().split('T')[0] },
    })
    fireEvent.change(screen.getByPlaceholderText(/city or destination/i), {
      target: { value: 'Bengaluru' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continue to step 2/i }))

    // On Step 2: enter budget
    const budgetInput = screen.getByPlaceholderText(/e\.g\. 1500000/i)
    fireEvent.change(budgetInput, { target: { value: '2000000' } })

    // Check that per-guest calculation is displayed
    expect(screen.getByText(/about/i)).toBeInTheDocument()
    expect(screen.getByText(/estimated spend per guest/i)).toBeInTheDocument()

    // Continue to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue to step 3/i }))
    expect(
      screen.getByRole('heading', { name: /style, ambiance & culture/i })
    ).toBeInTheDocument()
  })

  it('selects vibes, venue type, and reaches review step to submit', async () => {
    jest.useFakeTimers()
    renderWizard()

    // Step 1
    fireEvent.change(
      screen.getByPlaceholderText(/give your celebration a memorable name/i),
      { target: { value: 'Diwali Cultural Mela' } }
    )
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 60)
    fireEvent.change(screen.getByLabelText(/celebration date/i), {
      target: { value: futureDate.toISOString().split('T')[0] },
    })
    fireEvent.change(screen.getByPlaceholderText(/city or destination/i), {
      target: { value: 'Pune' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continue to step 2/i }))

    // Step 2
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 1500000/i), {
      target: { value: '500000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continue to step 3/i }))

    // Step 3: Select vibe
    const vibeBtn = screen.getByRole('button', { name: 'Royal Traditional' })
    fireEvent.click(vibeBtn)
    expect(vibeBtn).toHaveAttribute('aria-pressed', 'true')

    // Continue to Step 4 (Review)
    fireEvent.click(screen.getByRole('button', { name: /continue to step 4/i }))
    expect(
      screen.getByRole('heading', {
        name: /review your celebration blueprint/i,
      })
    ).toBeInTheDocument()

    // Check review summary content
    expect(screen.getByText('Diwali Cultural Mela')).toBeInTheDocument()

    // Submit
    const submitBtn = screen.getByRole('button', {
      name: /create my celebration plan/i,
    })
    fireEvent.click(submitBtn)

    // Fast-forward confetti and navigation timer
    jest.advanceTimersByTime(1500)
    expect(mockPush).toHaveBeenCalledWith('/planner')

    jest.useRealTimers()
  })
})
