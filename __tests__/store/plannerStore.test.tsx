import { createSampleProfiles } from '@/lib/engines/sampleData'
import {
  MAX_STORED_EVENTS,
  PlannerState,
  STORAGE_KEY,
  exportPlanAsJson,
  importPlanFromJson,
  plannerReducer,
} from '@/lib/store/plannerStore'

describe('plannerStore reducer & helpers', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)

  const emptyState: PlannerState = {
    events: [],
    activeEventId: null,
    hydrated: true,
  }

  it('uses festora:v1 as the storage key', () => {
    expect(STORAGE_KEY).toBe('festora:v1')
  })

  it('creates an event and sets it as active', () => {
    const next = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    expect(next.events.length).toBe(1)
    expect(next.activeEventId).toBe(next.events[0].id)
    expect(next.events[0].profile.name).toBe(samples.wedding.name)
    expect(next.events[0].budget.length).toBeGreaterThan(0)
    expect(next.events[0].tasks.length).toBeGreaterThan(0)
    expect(next.events[0].vendors.length).toBeGreaterThan(0)
  })

  it('loads a sample celebration', () => {
    const next = plannerReducer(emptyState, {
      type: 'LOAD_SAMPLE',
      payload: { kind: 'birthday', now: fixedNow },
    })

    expect(next.events.length).toBe(1)
    expect(next.events[0].profile.type).toBe('birthday')
    expect(next.activeEventId).toBe(next.events[0].id)
  })

  it('caps stored events at MAX_STORED_EVENTS (5)', () => {
    let state = emptyState
    for (let i = 0; i < 7; i++) {
      state = plannerReducer(state, {
        type: 'CREATE_EVENT',
        payload: {
          profile: {
            ...samples.wedding,
            name: `Event ${i + 1}`,
          },
          now: fixedNow,
        },
      })
    }

    expect(state.events.length).toBe(MAX_STORED_EVENTS)
    expect(state.events[0].profile.name).toBe('Event 7')
  })

  it('toggles task done status', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const targetTaskId = withEvent.events[0].tasks[0].id
    expect(withEvent.events[0].tasks[0].done).toBe(false)

    const toggled = plannerReducer(withEvent, {
      type: 'TOGGLE_TASK',
      payload: { taskId: targetTaskId },
    })
    expect(toggled.events[0].tasks[0].done).toBe(true)

    const untoggled = plannerReducer(toggled, {
      type: 'TOGGLE_TASK',
      payload: { taskId: targetTaskId },
    })
    expect(untoggled.events[0].tasks[0].done).toBe(false)
  })

  it('adds a custom user task', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const customTask = {
      id: 'custom-1',
      title: 'Pick up customized cake topper',
      category: 'cake',
      dueISO: '2026-06-15',
      phase: 'Final Week',
      critical: false,
      done: false,
      source: 'user' as const,
      notes: 'From local bakery',
    }

    const updated = plannerReducer(withEvent, {
      type: 'ADD_TASK',
      payload: { task: customTask },
    })

    expect(updated.events[0].tasks.some((t) => t.id === 'custom-1')).toBe(true)
  })

  it('updates budget lines and rebalances unlocked lines', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const originalVenue = withEvent.events[0].budget.find(
      (b) => b.id === 'venue'
    )!
    const newAllocated = originalVenue.allocated + 50000

    const updated = plannerReducer(withEvent, {
      type: 'UPDATE_BUDGET_LINE',
      payload: {
        lineId: 'venue',
        updates: { allocated: newAllocated },
      },
    })

    const updatedVenue = updated.events[0].budget.find((b) => b.id === 'venue')!
    expect(updatedVenue.allocated).toBe(newAllocated)

    // Total budget remains strictly preserved
    const totalAllocated = updated.events[0].budget.reduce(
      (sum, b) => sum + b.allocated,
      0
    )
    expect(totalAllocated).toBe(samples.wedding.budgetTotal)
  })

  it('locks a budget line so it will not rebalance', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const updated = plannerReducer(withEvent, {
      type: 'LOCK_BUDGET_LINE',
      payload: { lineId: 'catering', locked: true },
    })

    const cateringLine = updated.events[0].budget.find(
      (b) => b.id === 'catering'
    )!
    expect(cateringLine.locked).toBe(true)
  })

  it('adds an expense and increments category spent amount', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const expense = {
      id: 'exp-1',
      categoryId: 'venue' as const,
      label: 'Venue advance deposit',
      amount: 150000,
    }

    const updated = plannerReducer(withEvent, {
      type: 'ADD_EXPENSE',
      payload: { expense },
    })

    expect(updated.events[0].expenses.length).toBe(1)
    const venueLine = updated.events[0].budget.find((b) => b.id === 'venue')!
    expect(venueLine.spent).toBe(150000)
  })

  it('updates vendor information and quote', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const targetVendor = withEvent.events[0].vendors[0]
    const modifiedVendor = {
      ...targetVendor,
      name: 'Grand Regal Palace',
      quote: 500000,
      status: 'booked' as const,
    }

    const updated = plannerReducer(withEvent, {
      type: 'UPDATE_VENDOR',
      payload: { vendor: modifiedVendor },
    })

    const found = updated.events[0].vendors.find(
      (v) => v.id === targetVendor.id
    )!
    expect(found.name).toBe('Grand Regal Palace')
    expect(found.status).toBe('booked')
    expect(found.quote).toBe(500000)
  })

  it('deletes an event and switches active event', () => {
    let state = plannerReducer(emptyState, {
      type: 'LOAD_SAMPLE',
      payload: { kind: 'wedding', now: fixedNow },
    })
    state = plannerReducer(state, {
      type: 'LOAD_SAMPLE',
      payload: { kind: 'birthday', now: fixedNow },
    })

    expect(state.events.length).toBe(2)
    const birthdayId = state.activeEventId!

    const afterDelete = plannerReducer(state, {
      type: 'DELETE_EVENT',
      payload: { eventId: birthdayId },
    })

    expect(afterDelete.events.length).toBe(1)
    expect(afterDelete.activeEventId).toBe(afterDelete.events[0].id)
  })

  it('switches active event by id', () => {
    let state = plannerReducer(emptyState, {
      type: 'LOAD_SAMPLE',
      payload: { kind: 'wedding', now: fixedNow },
    })
    const weddingId = state.activeEventId!
    state = plannerReducer(state, {
      type: 'LOAD_SAMPLE',
      payload: { kind: 'birthday', now: fixedNow },
    })

    expect(state.activeEventId).not.toBe(weddingId)

    const switched = plannerReducer(state, {
      type: 'SET_ACTIVE',
      payload: { eventId: weddingId },
    })

    expect(switched.activeEventId).toBe(weddingId)
  })

  it('exports plan as JSON and imports it back round trip', () => {
    const withEvent = plannerReducer(emptyState, {
      type: 'CREATE_EVENT',
      payload: { profile: samples.wedding, now: fixedNow },
    })

    const originalPlan = withEvent.events[0]
    const jsonStr = exportPlanAsJson(originalPlan)
    expect(typeof jsonStr).toBe('string')

    const imported = importPlanFromJson(jsonStr)
    expect(imported.id).toBe(originalPlan.id)
    expect(imported.profile.name).toBe(originalPlan.profile.name)
    expect(imported.budget.length).toBe(originalPlan.budget.length)

    const importedState = plannerReducer(emptyState, {
      type: 'IMPORT_JSON',
      payload: { jsonString: jsonStr },
    })
    expect(importedState.events.length).toBe(1)
    expect(importedState.activeEventId).toBe(imported.id)
  })

  it('ignores corrupt or malformed JSON import without crashing', () => {
    const state = plannerReducer(emptyState, {
      type: 'IMPORT_JSON',
      payload: { jsonString: '{{malformed: json!' },
    })
    expect(state.events.length).toBe(0)
  })
})
