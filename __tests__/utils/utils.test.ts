import {
  parseAiBundle,
  parseBudgetLine,
  parseEventPlan,
  parseEventProfile,
  parseExpense,
  parseTask,
  parseVendor,
} from '@/lib/domain/schemas'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'
import {
  formatCompactNumber,
  formatDate,
  formatMoney,
} from '@/lib/utils/format'
import { generateId, resetIdCounter } from '@/lib/utils/ids'
import {
  collapseWhitespace,
  stripControlChars,
  stripTags,
  truncate,
} from '@/lib/utils/sanitize'

describe('utils and schemas', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')

  describe('format utils', () => {
    it('formats currency according to locales', () => {
      expect(formatMoney(1500000, 'INR')).toContain('15,00,000')
      expect(formatMoney(5000, 'USD')).toContain('5,000')
      expect(formatMoney(4500, 'EUR')).toContain('4.500')
      expect(formatMoney(3200, 'GBP')).toContain('3,200')
    })

    it('formats ISO dates into readable strings', () => {
      const formatted = formatDate('2026-11-15')
      expect(formatted).toContain('2026')
      expect(formatted).toContain('Nov')

      // Invalid date fallback
      expect(formatDate('invalid-date')).toBe('invalid-date')
    })

    it('formats numbers into compact notation', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K')
      expect(formatCompactNumber(2500000)).toBe('2.5M')
    })
  })

  describe('sanitize utils', () => {
    it('strips control characters while preserving tabs and newlines', () => {
      const raw = 'Hello\x00\x08World\t\nTest\x1F'
      expect(stripControlChars(raw)).toBe('HelloWorld\t\nTest')
    })

    it('collapses whitespace and trims', () => {
      const raw = '   Multiple    spaces   and\nnewlines   '
      expect(collapseWhitespace(raw)).toBe('Multiple spaces and newlines')
    })

    it('truncates strings at max length with ellipsis', () => {
      expect(truncate('Short', 10)).toBe('Short')
      expect(truncate('This is a longer sentence', 10)).toBe('This is...')
    })

    it('strips HTML/XML tags completely', () => {
      const html =
        '<p>Welcome <strong>user</strong> to <a href="#">Festora</a></p>'
      expect(stripTags(html)).toBe('Welcome user to Festora')
    })
  })

  describe('id generator', () => {
    it('generates unique collision-safe IDs', () => {
      resetIdCounter()
      const id1 = generateId('task')
      const id2 = generateId('task')
      expect(id1.startsWith('task-1-')).toBe(true)
      expect(id2.startsWith('task-2-')).toBe(true)
      expect(id1).not.toBe(id2)
    })
  })

  describe('schema safe parse helpers', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.wedding, fixedNow)

    it('returns typed success for valid entities', () => {
      expect(parseEventProfile(samples.wedding).success).toBe(true)
      expect(parseEventPlan(plan).success).toBe(true)
      expect(parseBudgetLine(plan.budget[0]).success).toBe(true)
      expect(parseTask(plan.tasks[0]).success).toBe(true)
      expect(parseVendor(plan.vendors[0]).success).toBe(true)
      expect(
        parseExpense({
          id: 'e1',
          categoryId: 'venue',
          label: 'Hall',
          amount: 1000,
        }).success
      ).toBe(true)
      expect(parseAiBundle(plan.aiBundle).success).toBe(true)
    })

    it('returns error message without throwing on invalid input', () => {
      const invalidProfile = parseEventProfile({ name: '', guests: -5 })
      expect(invalidProfile.success).toBe(false)
      if (!invalidProfile.success) {
        expect(invalidProfile.error.length).toBeGreaterThan(0)
      }

      const invalidTask = parseTask({ id: '' })
      expect(invalidTask.success).toBe(false)

      const invalidVendor = parseVendor({ quote: -10 })
      expect(invalidVendor.success).toBe(false)

      const invalidExpense = parseExpense({ amount: -100 })
      expect(invalidExpense.success).toBe(false)

      const invalidLine = parseBudgetLine({ percent: 150 })
      expect(invalidLine.success).toBe(false)

      const invalidPlan = parseEventPlan({ schemaVersion: 0 })
      expect(invalidPlan.success).toBe(false)

      const invalidAi = parseAiBundle({ themes: [1, 2, 3] })
      expect(invalidAi.success).toBe(false)
    })
  })
})
