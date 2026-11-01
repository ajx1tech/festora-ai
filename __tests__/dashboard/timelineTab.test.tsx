import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelineTab } from '@/components/dashboard/TimelineTab'
import { PlannerProvider } from '@/lib/store/plannerStore'
import { createPlanFromProfile, createSampleProfiles } from '@/lib/engines/sampleData'

describe('TimelineTab component', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const weddingPlan = createPlanFromProfile(samples.wedding, fixedNow)

  it('renders milestones grouped by phase and progress bar', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    expect(screen.getByText(/Backwards-Scheduled Milestones/i)).toBeInTheDocument()
    expect(screen.getByText(/Early Vision & Core Bookings/i)).toBeInTheDocument()
  })

  it('filters milestones by Critical, Overdue, and Done', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    const criticalFilter = screen.getByRole('button', { name: /Critical/i })
    fireEvent.click(criticalFilter)

    const allFilter = screen.getByRole('button', { name: /All/i })
    fireEvent.click(allFilter)
    expect(screen.getByText(weddingPlan.tasks[0].title)).toBeInTheDocument()
  })

  it('toggles task done status when checkbox is clicked', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    const firstTask = weddingPlan.tasks[0]
    const checkbox = screen.getByLabelText(`Toggle task completion: ${firstTask.title}`)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('allows editing and saving inline task notes', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    const editNoteBtn = screen.getAllByRole('button', { name: /note/i })[0]
    fireEvent.click(editNoteBtn)

    const input = screen.getByLabelText(new RegExp(`Notes for ${weddingPlan.tasks[0].title}`, 'i'))
    fireEvent.change(input, { target: { value: 'Vendor contact: +91 9876543210' } })

    const saveBtn = screen.getByRole('button', { name: /Save Note/i })
    fireEvent.click(saveBtn)

    expect(screen.getByText(/Vendor contact: \+91 9876543210/i)).toBeInTheDocument()
  })

  it('adds a custom milestone through the dialog', () => {
    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    const openBtn = screen.getByRole('button', { name: /Add Custom Milestone/i })
    fireEvent.click(openBtn)

    expect(screen.getByRole('heading', { name: /Add Custom Milestone/i })).toBeInTheDocument()

    const titleInput = screen.getByLabelText(/Milestone Title/i)
    const dueInput = screen.getByLabelText(/Due Date/i)

    fireEvent.change(titleInput, { target: { value: 'Book Mehendi Artist' } })
    fireEvent.change(dueInput, { target: { value: '2026-09-01' } })

    const submitBtn = screen.getByRole('button', { name: /^Add Milestone$/i })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Book Mehendi Artist')).toBeInTheDocument()
  })

  it('triggers calendar export download', () => {
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()

    render(
      <PlannerProvider initialState={{ events: [weddingPlan], activeEventId: weddingPlan.id }}>
        <TimelineTab />
      </PlannerProvider>
    )

    const exportBtn = screen.getByRole('button', { name: /Add to Calendar/i })
    fireEvent.click(exportBtn)

    expect(URL.createObjectURL).toHaveBeenCalled()

    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })
})
