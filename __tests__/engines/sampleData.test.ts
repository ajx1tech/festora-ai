import { EventPlanSchema, EventProfileSchema } from '@/lib/domain/schemas'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('sampleData', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')

  it('generates three valid sample profiles with future dates relative to now', () => {
    const samples = createSampleProfiles(fixedNow)

    for (const key of ['wedding', 'birthday', 'community'] as const) {
      const profile = samples[key]
      const parse = EventProfileSchema.safeParse(profile)
      expect(parse.success).toBe(true)
      expect(profile.dateISO > '2026-06-01').toBe(true)
    }

    expect(samples.wedding.city).toBe('Pune')
    expect(samples.wedding.guests).toBe(250)
    expect(samples.birthday.guests).toBe(40)
    expect(samples.community.guests).toBe(600)
  })

  it('assembles a complete, schema-valid EventPlan for each sample profile', () => {
    const samples = createSampleProfiles(fixedNow)

    for (const key of ['wedding', 'birthday', 'community'] as const) {
      const profile = samples[key]
      const plan = createPlanFromProfile(profile, fixedNow)
      const parse = EventPlanSchema.safeParse(plan)

      expect(parse.success).toBe(true)
      expect(plan.budget.length).toBeGreaterThan(0)
      expect(plan.tasks.length).toBeGreaterThan(0)
      expect(plan.vendors.length).toBeGreaterThan(0)
      expect(plan.runOfShow.length).toBeGreaterThan(0)
      expect(plan.aiBundle).toBeDefined()
    }
  })
})
