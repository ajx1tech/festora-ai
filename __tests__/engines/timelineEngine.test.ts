import type { EventProfile } from '@/lib/domain/schemas'
import {
  TASK_TEMPLATES,
  buildTimeline,
  completionStats,
  daysUntil,
  getOverdue,
  groupByPhase,
  nextActions,
} from '@/lib/engines/timelineEngine'

describe('timelineEngine', () => {
  const fixedNow = new Date('2026-01-01T00:00:00Z')

  describe('TASK_TEMPLATES counts', () => {
    it('wedding templates have between 20 and 28 tasks', () => {
      const count = TASK_TEMPLATES.wedding.length
      expect(count).toBeGreaterThanOrEqual(20)
      expect(count).toBeLessThanOrEqual(28)
    })

    it('birthday templates have between 14 and 18 tasks', () => {
      const count = TASK_TEMPLATES.birthday.length
      expect(count).toBeGreaterThanOrEqual(14)
      expect(count).toBeLessThanOrEqual(18)
    })

    it('community templates have between 16 and 20 tasks', () => {
      const count = TASK_TEMPLATES.community.length
      expect(count).toBeGreaterThanOrEqual(16)
      expect(count).toBeLessThanOrEqual(20)
    })
  })

  describe('buildTimeline standard backwards scheduling', () => {
    it('schedules tasks before the event date and in ascending chronological order', () => {
      const profile: EventProfile = {
        name: 'Normal Wedding',
        type: 'wedding',
        dateISO: '2026-12-01',
        guests: 200,
        budgetTotal: 2000000,
        currency: 'INR',
        city: 'Jaipur',
        venueType: 'hybrid',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const tasks = buildTimeline(profile, fixedNow)

      expect(tasks.length).toBe(TASK_TEMPLATES.wedding.length)

      // Guarantee 1: No task dated after event date
      for (const t of tasks) {
        expect(t.dueISO <= '2026-12-01').toBe(true)
        expect(t.compressed).toBe(false)
      }

      // Guarantee 2: Sorted ascending
      for (let i = 1; i < tasks.length; i += 1) {
        expect(tasks[i].dueISO >= tasks[i - 1].dueISO).toBe(true)
      }
    })
  })

  describe('COMPRESSED MODE', () => {
    it('triggers compressed mode when event date is shorter than max lead time', () => {
      // 30 days away, but wedding max lead is 300 days
      const profile: EventProfile = {
        name: 'Short Runway Wedding',
        type: 'wedding',
        dateISO: '2026-01-31',
        guests: 100,
        budgetTotal: 1000000,
        currency: 'INR',
        city: 'Goa',
        venueType: 'outdoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const tasks = buildTimeline(profile, fixedNow)

      // Every task should be flagged as compressed
      for (const t of tasks) {
        expect(t.compressed).toBe(true)
        expect(t.dueISO <= '2026-01-31').toBe(true)
        expect(t.critical).toBe(true) // Auto-flagged critical in compressed mode
      }

      // Chronological order preserved
      for (let i = 1; i < tasks.length; i += 1) {
        expect(tasks[i].dueISO >= tasks[i - 1].dueISO).toBe(true)
      }
    })

    it('handles tight 1-day or same-day runway safely', () => {
      const profile: EventProfile = {
        name: 'Urgent Party',
        type: 'birthday',
        dateISO: '2026-01-02',
        guests: 20,
        budgetTotal: 2000,
        currency: 'USD',
        city: 'Chicago',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const tasks = buildTimeline(profile, fixedNow)
      expect(tasks.length).toBeGreaterThan(0)
      for (const t of tasks) {
        expect(t.dueISO <= '2026-01-02').toBe(true)
      }
    })
  })

  describe('timeline helper functions', () => {
    const sampleTasks = [
      {
        id: 't1',
        title: 'Overdue task',
        category: 'venue',
        dueISO: '2025-12-25',
        phase: 'Phase 1',
        critical: true,
        done: false,
        source: 'template' as const,
        notes: '',
      },
      {
        id: 't2',
        title: 'Completed task',
        category: 'venue',
        dueISO: '2025-12-20',
        phase: 'Phase 1',
        critical: true,
        done: true,
        source: 'template' as const,
        notes: '',
      },
      {
        id: 't3',
        title: 'Future task',
        category: 'catering',
        dueISO: '2026-02-15',
        phase: 'Phase 2',
        critical: false,
        done: false,
        source: 'template' as const,
        notes: '',
      },
    ]

    it('detects overdue pending tasks accurately', () => {
      const overdue = getOverdue(sampleTasks, fixedNow)
      expect(overdue.length).toBe(1)
      expect(overdue[0].id).toBe('t1')
    })

    it('groups tasks by phase', () => {
      const groups = groupByPhase(sampleTasks)
      expect(groups['Phase 1'].length).toBe(2)
      expect(groups['Phase 2'].length).toBe(1)
    })

    it('calculates completion statistics', () => {
      const stats = completionStats(sampleTasks)
      expect(stats.total).toBe(3)
      expect(stats.completed).toBe(1)
      expect(stats.percent).toBe(33)
      expect(stats.criticalPending).toBe(1)
    })

    it('calculates daysUntil accurately', () => {
      expect(daysUntil('2026-01-11', fixedNow)).toBe(10)
      expect(daysUntil('2025-12-22', fixedNow)).toBe(-10)
    })

    it('ranks nextActions with overdue and critical prioritized', () => {
      const actions = nextActions(sampleTasks, fixedNow, 2)
      expect(actions.length).toBe(2)
      expect(actions[0].id).toBe('t1') // overdue critical comes first
      expect(actions[1].id).toBe('t3')
    })
  })
})
