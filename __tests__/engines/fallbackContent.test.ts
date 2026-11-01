import { AiBundleSchema, RunOfShowItemSchema } from '@/lib/domain/schemas'
import {
  fallbackChatAnswer,
  fallbackIdeas,
  fallbackInvitation,
  fallbackRunOfShow,
  fallbackVendorMessage,
} from '@/lib/engines/fallbackContent'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('fallbackContent', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)

  describe('fallbackIdeas', () => {
    it('returns valid AiBundle matching schema for all 3 event types', () => {
      for (const type of ['wedding', 'birthday', 'community'] as const) {
        const bundle = fallbackIdeas(samples[type])
        const parse = AiBundleSchema.safeParse(bundle)
        expect(parse.success).toBe(true)
        expect(bundle.concept).toBeTruthy()
        expect(bundle.themes?.length).toBe(3)
        expect(bundle.ideas?.length).toBe(8)
        expect(bundle.savingTips?.length).toBe(4)
        expect(bundle.source).toBe('template')
      }
    })

    it('adjusts first saving tip when budget per guest is tight', () => {
      const tightProfile = {
        ...samples.community,
        budgetTotal: 50000,
        guests: 500, // 100/guest
      }
      const bundle = fallbackIdeas(tightProfile)
      expect(bundle.savingTips?.[0]).toContain(
        'Focus decor spending exclusively'
      )
    })
  })

  describe('fallbackRunOfShow', () => {
    it('returns valid schedule blocks for all event types', () => {
      for (const type of ['wedding', 'birthday', 'community'] as const) {
        const runOfShow = fallbackRunOfShow(samples[type])
        expect(runOfShow.length).toBeGreaterThanOrEqual(6)
        for (const item of runOfShow) {
          const parse = RunOfShowItemSchema.safeParse(item)
          expect(parse.success).toBe(true)
          expect(item.time).toBeTruthy()
          expect(item.title).toBeTruthy()
          expect(item.detail).toBeTruthy()
        }
      }
    })
  })

  describe('fallbackInvitation', () => {
    it('generates invitations for all supported languages and event types', () => {
      const languages = ['en', 'hi', 'mr', 'es', 'fr']
      const types = ['wedding', 'birthday', 'community'] as const

      for (const t of types) {
        for (const lang of languages) {
          const invite = fallbackInvitation(samples[t], 'warm', lang)
          expect(invite.title).toBeTruthy()
          expect(invite.body).toBeTruthy()
          expect(invite.rsvp).toBeTruthy()
          expect(invite.source).toBe('template')
        }
      }
    })

    it('generates formal invitations in Hindi and Marathi', () => {
      const hiFormal = fallbackInvitation(samples.wedding, 'formal', 'hi')
      expect(hiFormal.body).toContain('सस्नेह नमस्कार')

      const mrFormal = fallbackInvitation(samples.wedding, 'formal', 'mr')
      expect(mrFormal.body).toContain('॥ श्री गणेशाय नमः ॥')
    })
  })

  describe('fallbackVendorMessage', () => {
    it('drafts vendor outreach message with event details and questions', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const vendor = plan.vendors[0]

      const message = fallbackVendorMessage(plan.profile, vendor)
      expect(message.subject).toContain(plan.profile.name)
      expect(message.subject).toContain(plan.profile.city)
      expect(message.message).toContain(vendor.name)
      expect(message.message).toContain(String(plan.profile.guests))
      expect(message.source).toBe('template')
    })

    it('falls back to default questions when vendor category is unfamiliar', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const customVendor = {
        ...plan.vendors[0],
        category: 'unfamiliar_category',
      }
      const message = fallbackVendorMessage(plan.profile, customVendor)
      expect(message.message).toContain(
        'availability and full service quote breakdown'
      )
    })
  })

  describe('fallbackChatAnswer', () => {
    it('answers budget queries with factual totals and breakdown', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const answer = fallbackChatAnswer('How much budget do I have left?', plan)

      expect(answer.source).toBe('template')
      expect(answer.answer).toContain('Total Budget')
      expect(answer.answer).toContain('Remaining Available Funds')
    })

    it('flags overspent categories in budget queries', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      plan.expenses = [
        { id: 'e1', categoryId: 'venue', label: 'Overspend', amount: 9999999 },
      ]
      const answer = fallbackChatAnswer('What is my budget status?', plan)
      expect(answer.answer).toContain(
        'Notice: The following categories currently exceed allocation'
      )
    })

    it('answers next actions queries with prioritized task deadlines', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const answer = fallbackChatAnswer('What should I do next?', plan)

      expect(answer.source).toBe('template')
      expect(answer.answer).toContain('urgent upcoming milestones')
    })

    it('answers next actions gracefully when all tasks are complete', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      plan.tasks = plan.tasks.map((t) => ({ ...t, done: true }))
      const answer = fallbackChatAnswer(
        'What is next on the action list?',
        plan
      )
      expect(answer.answer).toContain(
        'All scheduled tasks are currently completed'
      )
    })

    it('answers overdue queries cleanly when no tasks are overdue', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const answer = fallbackChatAnswer('Are any tasks overdue or late?', plan)

      expect(answer.source).toBe('template')
      expect(answer.answer).toContain('zero overdue tasks')
    })

    it('reports overdue tasks accurately when tasks are past due', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      plan.tasks[0].dueISO = '2025-01-01'
      plan.tasks[0].done = false

      const answer = fallbackChatAnswer('Show me overdue tasks', plan)
      expect(answer.answer).toContain('Attention required: You have')
      expect(answer.answer).toContain(plan.tasks[0].title)
    })

    it('answers vendor status queries with hiring progress', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const answer = fallbackChatAnswer(
        'What is the vendor hiring status?',
        plan
      )

      expect(answer.source).toBe('template')
      expect(answer.answer).toContain('Vendor hiring status')
    })

    it('provides a general event overview for unclassified queries', () => {
      const plan = createPlanFromProfile(samples.wedding, fixedNow)
      const answer = fallbackChatAnswer('Tell me about my event', plan)

      expect(answer.source).toBe('template')
      expect(answer.answer).toContain(plan.profile.name)
      expect(answer.answer).toContain(plan.profile.city)
    })
  })
})
