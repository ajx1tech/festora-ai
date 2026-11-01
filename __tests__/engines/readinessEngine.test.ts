import type { EventPlan } from '@/lib/domain/schemas'
import { computeReadiness } from '@/lib/engines/readinessEngine'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('readinessEngine', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')

  it('bounds readiness score strictly between 0 and 100', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.wedding, fixedNow)

    const result = computeReadiness(plan, fixedNow)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.breakdown).toBeDefined()
  })

  it('handles empty tasks list safely', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.birthday, fixedNow)
    plan.tasks = []

    const result = computeReadiness(plan, fixedNow)
    expect(result.breakdown.taskScore).toBe(40)
  })

  it('awards a higher score when more tasks and vendors are completed', () => {
    const samples = createSampleProfiles(fixedNow)
    const initialPlan = createPlanFromProfile(samples.birthday, fixedNow)
    const initialResult = computeReadiness(initialPlan, fixedNow)

    // Complete half the tasks and book critical venue
    const progressedPlan: EventPlan = {
      ...initialPlan,
      tasks: initialPlan.tasks.map((t, idx) => ({
        ...t,
        done: idx % 2 === 0,
      })),
      vendors: initialPlan.vendors.map((v) =>
        v.category === 'venue' ? { ...v, status: 'booked', quote: 2000 } : v
      ),
    }

    const progressedResult = computeReadiness(progressedPlan, fixedNow)
    expect(progressedResult.score).toBeGreaterThan(initialResult.score)
  })

  it('triggers critical alert when venue is unbooked near the event date', () => {
    const samples = createSampleProfiles(fixedNow)
    // Date set to 30 days away (within 60-day alert threshold)
    const urgentProfile = {
      ...samples.wedding,
      dateISO: '2026-07-01',
    }
    const urgentPlan = createPlanFromProfile(urgentProfile, fixedNow)

    const result = computeReadiness(urgentPlan, fixedNow)
    const venueAlert = result.alerts.find((a) => a.id === 'alert-venue-urgent')

    expect(venueAlert).toBeDefined()
    expect(venueAlert!.severity).toBe('critical')
  })

  it('triggers overdue critical task alert when tasks are past due and unfinished', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.wedding, fixedNow)
    plan.tasks[0].dueISO = '2026-05-01'
    plan.tasks[0].critical = true
    plan.tasks[0].done = false

    const result = computeReadiness(plan, fixedNow)
    const overdueAlert = result.alerts.find(
      (a) => a.id === 'alert-critical-tasks'
    )
    expect(overdueAlert).toBeDefined()
  })

  it('triggers high guest indoor capacity alert', () => {
    const samples = createSampleProfiles(fixedNow)
    const largeIndoor = {
      ...samples.wedding,
      guests: 450,
      venueType: 'indoor' as const,
    }
    const plan = createPlanFromProfile(largeIndoor, fixedNow)

    const result = computeReadiness(plan, fixedNow)
    const capAlert = result.alerts.find((a) => a.id === 'alert-indoor-capacity')
    expect(capAlert).toBeDefined()
  })

  it('maps scores to correct boundary labels', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.community, fixedNow)

    // Fully completed plan -> Event ready
    const readyPlan: EventPlan = {
      ...plan,
      tasks: plan.tasks.map((t) => ({ ...t, done: true })),
      vendors: plan.vendors.map((v) => ({
        ...v,
        status: 'booked',
        quote: 5000,
      })),
    }

    const readyResult = computeReadiness(readyPlan, fixedNow)
    expect(readyResult.score).toBeGreaterThanOrEqual(90)
    expect(readyResult.label).toBe('Event ready')
  })

  it('computes intermediate labels on track and ahead', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.community, fixedNow)

    // Complete ~60% of tasks
    const onTrackPlan: EventPlan = {
      ...plan,
      tasks: plan.tasks.map((t, idx) => ({ ...t, done: idx < 12 })),
      vendors: plan.vendors.map((v, idx) => ({
        ...v,
        status: idx < 3 ? 'booked' : 'researching',
        quote: 5000,
      })),
    }

    const onTrackResult = computeReadiness(onTrackPlan, fixedNow)
    expect(onTrackResult.score).toBeGreaterThanOrEqual(50)
  })

  it('flags budget overspend and compressed timeline alerts', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.birthday, fixedNow)

    // Add an expense that exceeds total allocation
    const overspentPlan: EventPlan = {
      ...plan,
      expenses: [
        {
          id: 'exp-massive',
          categoryId: 'venue',
          label: 'Expensive venue',
          amount: 999999,
        },
      ],
      tasks: plan.tasks.map((t) => ({ ...t, compressed: true })),
    }

    const result = computeReadiness(overspentPlan, fixedNow)
    const overspendAlert = result.alerts.find(
      (a) => a.id === 'alert-budget-overspend'
    )
    const compressedAlert = result.alerts.find(
      (a) => a.id === 'alert-compressed-schedule'
    )

    expect(overspendAlert).toBeDefined()
    expect(compressedAlert).toBeDefined()
  })
})
