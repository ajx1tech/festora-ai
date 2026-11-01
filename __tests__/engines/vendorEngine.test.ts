import type { EventProfile, Expense, Vendor } from '@/lib/domain/schemas'
import {
  VENDOR_CATALOG,
  buildVendorChecklist,
  committedSpend,
  syncVendorSpendToExpenses,
  vendorProgress,
} from '@/lib/engines/vendorEngine'

describe('vendorEngine', () => {
  describe('VENDOR_CATALOG', () => {
    it('every category in all event types contains 5 to 6 questions to ask', () => {
      const types = ['wedding', 'birthday', 'community'] as const
      for (const t of types) {
        const catalog = VENDOR_CATALOG[t]
        expect(catalog.length).toBeGreaterThanOrEqual(6)
        for (const entry of catalog) {
          expect(entry.questionsToAsk.length).toBeGreaterThanOrEqual(5)
          expect(entry.questionsToAsk.length).toBeLessThanOrEqual(6)
        }
      }
    })
  })

  describe('buildVendorChecklist', () => {
    it('initializes vendor checklist matching catalog categories with researching status', () => {
      const profile: EventProfile = {
        name: 'Wedding Checklist Test',
        type: 'wedding',
        dateISO: '2026-11-01',
        guests: 150,
        budgetTotal: 1500000,
        currency: 'INR',
        city: 'Delhi',
        venueType: 'indoor',
        vibes: [],
        dietary: [],
        traditions: '',
        priorities: [],
      }

      const vendors = buildVendorChecklist(profile)
      expect(vendors.length).toBe(VENDOR_CATALOG.wedding.length)
      for (const v of vendors) {
        expect(v.status).toBe('researching')
        expect(v.quote).toBe(0)
      }
    })
  })

  describe('vendorProgress and committedSpend', () => {
    const sampleVendors: Vendor[] = [
      {
        id: 'v1',
        category: 'venue',
        name: 'Grand Ballroom',
        status: 'booked',
        quote: 50000,
        notes: '',
      },
      {
        id: 'v2',
        category: 'catering',
        name: 'Gourmet Caterers',
        status: 'paid',
        quote: 30000,
        notes: '',
      },
      {
        id: 'v3',
        category: 'photography',
        name: 'Lens Studio',
        status: 'contacted',
        quote: 15000,
        notes: '',
      },
      {
        id: 'v4',
        category: 'decor',
        name: 'Bloom Decor',
        status: 'researching',
        quote: 0,
        notes: '',
      },
    ]

    it('calculates vendor progress metrics', () => {
      const progress = vendorProgress(sampleVendors, 'wedding')
      expect(progress.total).toBe(4)
      expect(progress.bookedOrPaid).toBe(2)
      expect(progress.percent).toBe(50)
    })

    it('sums committed spend only for booked or paid vendors', () => {
      const total = committedSpend(sampleVendors)
      // Only venue (50000) and catering (30000) count. Contacted lens studio (15000) is excluded.
      expect(total).toBe(80000)
    })
  })

  describe('syncVendorSpendToExpenses', () => {
    it('synchronizes booked vendor quotes into the expense ledger', () => {
      const vendors: Vendor[] = [
        {
          id: 'v-venue',
          category: 'venue',
          name: 'The Palace',
          status: 'booked',
          quote: 45000,
          notes: '',
        },
        {
          id: 'v-decor',
          category: 'decor',
          name: 'Floral Magic',
          status: 'researching',
          quote: 20000,
          notes: '',
        },
      ]

      const initialExpenses: Expense[] = [
        {
          id: 'exp-1',
          categoryId: 'invitations',
          label: 'Stamps',
          amount: 500,
        },
      ]

      const synced = syncVendorSpendToExpenses(vendors, initialExpenses)

      expect(synced.length).toBe(2)
      const venueExpense = synced.find((e) => e.id === 'exp-vendor-v-venue')
      expect(venueExpense).toBeDefined()
      expect(venueExpense!.amount).toBe(45000)

      // Unbooked decor is not converted to an expense
      expect(synced.some((e) => e.id === 'exp-vendor-v-decor')).toBe(false)
    })
  })
})
