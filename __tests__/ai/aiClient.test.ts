import { act, renderHook } from '@testing-library/react'
import { callAi, getLocalFallbackData, useAi } from '@/lib/ai/aiClient'
import type { AiRequest } from '@/lib/ai/aiSchemas'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('aiClient and useAi hook', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const plan = createPlanFromProfile(samples.wedding, fixedNow)
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  describe('getLocalFallbackData', () => {
    it('produces valid fallback structures across all 5 task types', () => {
      const tasks: AiRequest[] = [
        { task: 'ideas', plan },
        { task: 'chat', plan, message: 'How much spent?' },
        { task: 'vendor_message', plan, vendorId: plan.vendors[0].id },
        { task: 'invitation', plan, tone: 'heartfelt', language: 'en' },
        { task: 'run_of_show', plan },
      ]

      for (const req of tasks) {
        const fallback = getLocalFallbackData(req)
        expect(fallback).toBeDefined()
      }
    })
  })

  describe('callAi', () => {
    it('returns server envelope on successful 200 response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          source: 'gemini',
          model: 'gemini-3.8-flash',
          data: { concept: 'Custom Concept' },
        }),
      } as unknown as Response)

      const response = await callAi({ task: 'ideas', plan })
      expect(response.ok).toBe(true)
      expect(response.source).toBe('gemini')
      expect((response.data as { concept: string }).concept).toBe(
        'Custom Concept'
      )
    })

    it('seamlessly falls back to local template data when fetch throws network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network offline'))

      const response = await callAi({ task: 'ideas', plan })
      expect(response.ok).toBe(true)
      expect(response.source).toBe('template')
      expect(response.data).toBeDefined()
    })

    it('seamlessly falls back to local template data when server returns 500 error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as unknown as Response)

      const response = await callAi({ task: 'ideas', plan })
      expect(response.ok).toBe(true)
      expect(response.source).toBe('template')
      expect(response.data).toBeDefined()
    })
  })

  describe('useAi hook', () => {
    it('manages loading, source, data, and aria status announcements', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          source: 'gemini',
          model: 'gemini-3.8-flash',
          data: { answer: 'All good!' },
        }),
      } as unknown as Response)

      const { result } = renderHook(() => useAi<{ answer: string }>())

      expect(result.current.loading).toBe(false)
      expect(result.current.statusText).toBe('Idle')

      await act(async () => {
        await result.current.run({
          task: 'chat',
          plan,
          message: 'Status check',
        })
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.source).toBe('gemini')
      expect(result.current.data?.answer).toBe('All good!')
      expect(result.current.statusText).toBe(
        'Content successfully generated with AI.'
      )
    })
  })
})
