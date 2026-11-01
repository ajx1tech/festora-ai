import type { EventProfile } from '@/lib/domain/schemas'
import {
  ALLOCATION_TEMPLATES,
  buildBudget,
  rebalance,
  summarize,
  whatIf,
} from '@/lib/engines/budgetEngine'

describe('budgetEngine', () => {
  describe('ALLOCATION_TEMPLATES', () => {
    it('percentages sum to exactly 100 for wedding', () => {
      const sum = ALLOCATION_TEMPLATES.wedding.reduce(
        (acc, item) => acc + item.percent,
        0
      )
      expect(sum).toBe(100)
    })

    it('percentages sum to exactly 100 for birthday', () => {
      const sum = ALLOCATION_TEMPLATES.birthday.reduce(
        (acc, item) => acc + item.percent,
        0
      )
      expect(sum).toBe(100)
    })

    it('percentages sum to exactly 100 for community', () => {
      const sum = ALLOCATION_TEMPLATES.community.reduce(
        (acc, item) => acc + item.percent,
        0
      )
      expect(sum).toBe(100)
    })

    it('includes a contingency line between 8% and 10% in all templates', () => {
      for (const type of ['wedding', 'birthday', 'community'] as const) {
        const contingency = ALLOCATION_TEMPLATES[type].find(
          (item) => item.id === 'contingency'
        )
        expect(contingency).toBeDefined()
        expect(contingency!.percent).toBeGreaterThanOrEqual(8)
        expect(contingency!.percent).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('buildBudget and Largest-Remainder distribution', () => {
    it('applies priority boost to designated categories', () => {
      const baseProfile: EventProfile = {
        name: 'Priority Test',
        type: 'wedding',
        dateISO: '2026-11-01',
        guests: 100,
        budgetTotal: 1000000,
        currency: 'INR',
        city: 'Mumbai',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: ['venue'],
      }

      const budget = buildBudget(baseProfile)
      const venueLine = budget.find((l) => l.id === 'venue')
      const templateVenue = ALLOCATION_TEMPLATES.wedding.find(
        (t) => t.id === 'venue'
      )!

      expect(venueLine!.percent).toBeGreaterThan(templateVenue.percent)
      const totalAllocated = budget.reduce((acc, l) => acc + l.allocated, 0)
      expect(totalAllocated).toBe(1000000)
    })

    it('allocated sum equals budgetTotal exactly for 50 diverse random profiles', () => {
      const eventTypes = ['wedding', 'birthday', 'community'] as const
      const currencies = ['INR', 'USD', 'EUR', 'GBP'] as const

      for (let i = 0; i < 50; i += 1) {
        const type = eventTypes[i % eventTypes.length]
        const currency = currencies[i % currencies.length]
        // Vary budget from small to large odd numbers
        const budgetTotal = 5000 + i * 37913 + (i % 7) * 11111
        const guests = 10 + ((i * 37) % 1500)

        const testProfile: EventProfile = {
          name: `Test Profile ${i}`,
          type,
          dateISO: '2026-12-01',
          guests,
          budgetTotal,
          currency,
          city: 'Test City',
          venueType: 'hybrid',
          vibes: ['Festive'],
          dietary: [],
          traditions: '',
          priorities: i % 2 === 0 ? ['venue'] : ['catering', 'decor'],
        }

        const lines = buildBudget(testProfile)
        const totalAllocated = lines.reduce((acc, l) => acc + l.allocated, 0)
        expect(totalAllocated).toBe(budgetTotal)

        // Verify no negative allocations
        for (const line of lines) {
          expect(line.allocated).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('rebalance', () => {
    it('preserves total budget when rebalancing', () => {
      const profile: EventProfile = {
        name: 'Rebalance Test',
        type: 'wedding',
        dateISO: '2026-12-01',
        guests: 100,
        budgetTotal: 100000,
        currency: 'USD',
        city: 'NY',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const initial = buildBudget(profile)
      const initialTotal = initial.reduce((sum, l) => sum + l.allocated, 0)

      // Edit venue line to higher amount
      const updated = rebalance(initial, 'venue', 35000)
      const updatedVenue = updated.find((l) => l.id === 'venue')!
      expect(updatedVenue.allocated).toBe(35000)

      const updatedTotal = updated.reduce((sum, l) => sum + l.allocated, 0)
      expect(updatedTotal).toBe(initialTotal)
    })

    it('respects locked lines during redistribution', () => {
      const profile: EventProfile = {
        name: 'Lock Test',
        type: 'birthday',
        dateISO: '2026-12-01',
        guests: 30,
        budgetTotal: 10000,
        currency: 'USD',
        city: 'LA',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const initial = buildBudget(profile)
      // Lock catering line
      const cateringInitial = initial.find((l) => l.id === 'catering')!
      cateringInitial.locked = true
      const lockedAmount = cateringInitial.allocated

      const rebalanced = rebalance(initial, 'venue', 3000)
      const cateringAfter = rebalanced.find((l) => l.id === 'catering')!

      expect(cateringAfter.allocated).toBe(lockedAmount)
      const total = rebalanced.reduce((s, l) => s + l.allocated, 0)
      expect(total).toBe(10000)
    })

    it('handles zero delta and non-existent id gracefully', () => {
      const profile: EventProfile = {
        name: 'Graceful Test',
        type: 'birthday',
        dateISO: '2026-12-01',
        guests: 30,
        budgetTotal: 10000,
        currency: 'USD',
        city: 'LA',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const initial = buildBudget(profile)
      const venueAmount = initial.find((l) => l.id === 'venue')!.allocated

      // Zero delta
      const same = rebalance(initial, 'venue', venueAmount)
      expect(same.find((l) => l.id === 'venue')!.allocated).toBe(venueAmount)

      // Invalid ID
      const untouched = rebalance(initial, 'invalid_id' as never, 5000)
      expect(untouched).toEqual(initial)
    })

    it('prevents negative allocation amounts', () => {
      const profile: EventProfile = {
        name: 'Floor Test',
        type: 'birthday',
        dateISO: '2026-12-01',
        guests: 30,
        budgetTotal: 1000,
        currency: 'USD',
        city: 'LA',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const initial = buildBudget(profile)
      // Attempt to increase venue to 999 which exhausts other lines
      const rebalanced = rebalance(initial, 'venue', 999)
      for (const line of rebalanced) {
        expect(line.allocated).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('summarize', () => {
    it('calculates totals, per-guest cost, and status thresholds accurately', () => {
      const lines = [
        {
          id: 'venue' as const,
          label: 'Venue',
          percent: 50,
          allocated: 5000,
          spent: 0,
          locked: false,
        },
        {
          id: 'catering' as const,
          label: 'Catering',
          percent: 50,
          allocated: 5000,
          spent: 0,
          locked: false,
        },
      ]

      // Under 85% spent -> on-track
      const summaryOnTrack = summarize(
        lines,
        [{ id: 'e1', categoryId: 'venue', label: 'Deposit', amount: 3000 }],
        50
      )
      expect(summaryOnTrack.totalAllocated).toBe(10000)
      expect(summaryOnTrack.totalSpent).toBe(3000)
      expect(summaryOnTrack.remaining).toBe(7000)
      expect(summaryOnTrack.perGuestCost).toBe(200)
      expect(summaryOnTrack.status).toBe('on-track')

      // 85% to 100% -> watch
      const summaryWatch = summarize(
        lines,
        [{ id: 'e1', categoryId: 'venue', label: 'Payment', amount: 8800 }],
        50
      )
      expect(summaryWatch.status).toBe('watch')

      // > 100% -> over
      const summaryOver = summarize(
        lines,
        [
          { id: 'e1', categoryId: 'venue', label: 'Payment', amount: 6000 },
          { id: 'e2', categoryId: 'catering', label: 'Payment', amount: 5000 },
        ],
        50
      )
      expect(summaryOver.status).toBe('over')
      expect(summaryOver.overspentCategories).toContain('venue')
    })
  })

  describe('whatIf', () => {
    it('calculates scenarios without mutating original profile', () => {
      const original: EventProfile = {
        name: 'Original',
        type: 'wedding',
        dateISO: '2026-12-01',
        guests: 100,
        budgetTotal: 100000,
        currency: 'USD',
        city: 'Boston',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const result = whatIf(original, { guests: 200, budgetTotal: 150000 })

      expect(result.perGuestCost).toBe(750)
      expect(original.guests).toBe(100)
      expect(original.budgetTotal).toBe(100000)

      const sum = result.budget.reduce((acc, l) => acc + l.allocated, 0)
      expect(sum).toBe(150000)
    })
  })
})
