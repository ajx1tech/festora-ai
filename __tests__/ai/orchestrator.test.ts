import { generateContent } from '@/lib/ai/geminiClient'
import { runAiTask } from '@/lib/ai/orchestrator'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

jest.mock('@/lib/ai/geminiClient', () => ({
  generateContent: jest.fn(),
}))

const mockGenerate = generateContent as jest.Mock

describe('orchestrator', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const plan = createPlanFromProfile(samples.wedding, fixedNow)

  beforeEach(() => {
    mockGenerate.mockReset()
  })

  it('accepts valid JSON from Gemini and returns source: gemini', async () => {
    const validIdeas = JSON.stringify({
      concept: 'A stunning royal wedding in Pune.',
      themes: ['Royal Gold', 'Garden Bloom', 'Sunset Terracotta'],
      ideas: [
        {
          title: 'Live Sitar',
          description: 'Acoustic melodies during dinner',
          estimatedCostBand: 'mid',
          category: 'music',
        },
      ],
      savingTips: ['Use seasonal florals'],
    })

    mockGenerate.mockResolvedValue({
      success: true,
      text: validIdeas,
      model: 'gemini-3.8-flash',
    })

    const result = await runAiTask({ task: 'ideas', plan })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('gemini')
    expect(result.model).toBe('gemini-3.8-flash')
    expect((result.data as { concept: string }).concept).toBe(
      'A stunning royal wedding in Pune.'
    )
  })

  it('unwraps markdown fenced JSON and succeeds with source: gemini', async () => {
    const fencedRunOfShow = `\`\`\`json
{
  "items": [
    {
      "time": "09:00 AM",
      "title": "Decor Arrival",
      "detail": "Stage crew sets up lighting."
    }
  ]
}
\`\`\``

    mockGenerate.mockResolvedValue({
      success: true,
      text: fencedRunOfShow,
      model: 'gemini-3.8-flash',
    })

    const result = await runAiTask({ task: 'run_of_show', plan })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('gemini')
    expect((result.data as { items: unknown[] }).items.length).toBe(1)
  })

  it('triggers exactly one repair call when initial JSON is invalid, then succeeds', async () => {
    const brokenJson = '{"concept": "Broken concept", invalid syntax'
    const repairedJson = JSON.stringify({
      concept: 'Repaired concept',
      themes: ['Theme A', 'Theme B', 'Theme C'],
      ideas: [
        {
          title: 'Repaired Idea',
          description: 'Valid detail',
          estimatedCostBand: 'low',
          category: 'decor',
        },
      ],
      savingTips: ['Valid Tip'],
    })

    mockGenerate
      .mockResolvedValueOnce({
        success: true,
        text: brokenJson,
        model: 'gemini-3.8-flash',
      })
      .mockResolvedValueOnce({
        success: true,
        text: repairedJson,
        model: 'gemini-3.8-flash',
      })

    const result = await runAiTask({ task: 'ideas', plan })

    expect(mockGenerate).toHaveBeenCalledTimes(2)
    expect(result.ok).toBe(true)
    expect(result.source).toBe('gemini')
    expect((result.data as { concept: string }).concept).toBe(
      'Repaired concept'
    )
  })

  it('returns template fallback with source: template when repair also fails', async () => {
    const brokenJson = '{"concept": "Never valid"'

    mockGenerate.mockResolvedValue({
      success: true,
      text: brokenJson,
      model: 'gemini-3.8-flash',
    })

    const result = await runAiTask({ task: 'ideas', plan })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('template')
    expect(result.data).toBeDefined()
    expect((result.data as { concept: string }).concept.length).toBeGreaterThan(
      0
    )
  })

  it('returns template fallback when API key is missing or client returns error', async () => {
    mockGenerate.mockResolvedValue({
      success: false,
      error: {
        code: 'no_key',
        retryable: false,
        message: 'No key',
      },
    })

    const result = await runAiTask({ task: 'ideas', plan })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('template')
    expect(result.data).toBeDefined()
  })

  it('executes chat task and falls back to offline answer when model fails', async () => {
    mockGenerate.mockResolvedValue({
      success: false,
      error: { code: 'quota', retryable: true, message: 'Rate limited' },
    })

    const result = await runAiTask({
      task: 'chat',
      plan,
      message: 'What is my budget status?',
    })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('template')
    expect((result.data as { answer: string }).answer).toContain('Total Budget')
  })

  it('executes vendor message and falls back to offline template on error', async () => {
    mockGenerate.mockResolvedValue({
      success: false,
      error: { code: 'upstream', retryable: true, message: 'Server down' },
    })

    const result = await runAiTask({
      task: 'vendor_message',
      plan,
      vendorId: plan.vendors[0].id,
    })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('template')
    expect((result.data as { subject: string }).subject).toContain(
      plan.profile.name
    )
  })

  it('executes invitation task and falls back to dual variant templates on error', async () => {
    mockGenerate.mockResolvedValue({
      success: false,
      error: { code: 'upstream', retryable: true, message: 'Down' },
    })

    const result = await runAiTask({
      task: 'invitation',
      plan,
      tone: 'formal',
      language: 'en',
    })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('template')
    const inv = result.data as {
      variantA: { title: string }
      variantB: { title: string }
    }
    expect(inv.variantA.title).toBeTruthy()
    expect(inv.variantB.title).toBeTruthy()
  })

  it('executes chat task and succeeds with Gemini response', async () => {
    mockGenerate.mockResolvedValue({
      success: true,
      text: 'You have spent 25% of your catering budget.',
      model: 'gemini-3.8-flash',
    })

    const result = await runAiTask({
      task: 'chat',
      plan,
      message: 'How is catering spending?',
    })

    expect(result.ok).toBe(true)
    expect(result.source).toBe('gemini')
    expect((result.data as { answer: string }).answer).toBe(
      'You have spent 25% of your catering budget.'
    )
  })

  it('executes vendor_message task and succeeds with Gemini response and repair', async () => {
    const validVendorMsg = JSON.stringify({
      subject: 'Inquiry for Catering',
      message: 'Hello, inquiring about catering services.',
    })

    // Test direct success
    mockGenerate.mockResolvedValueOnce({
      success: true,
      text: validVendorMsg,
      model: 'gemini-3.8-flash',
    })

    const directResult = await runAiTask({
      task: 'vendor_message',
      plan,
      vendorId: plan.vendors[0].id,
    })
    expect(directResult.ok).toBe(true)
    expect(directResult.source).toBe('gemini')

    // Test repair flow
    mockGenerate
      .mockResolvedValueOnce({
        success: true,
        text: 'not valid json',
        model: 'gemini-3.8-flash',
      })
      .mockResolvedValueOnce({
        success: true,
        text: validVendorMsg,
        model: 'gemini-3.8-flash',
      })

    const repairResult = await runAiTask({
      task: 'vendor_message',
      plan,
      vendorId: plan.vendors[0].id,
    })
    expect(repairResult.ok).toBe(true)
    expect(repairResult.source).toBe('gemini')
  })

  it('executes invitation task with Gemini success and repair', async () => {
    const validInv = JSON.stringify({
      variantA: {
        title: 'Wedding Celebration',
        body: 'Join us in celebrating this special day with warmth and joy.',
        rsvp: 'RSVP by June 1st.',
      },
      variantB: {
        title: 'Save the Date',
        body: 'We are getting married and would love your presence.',
        rsvp: 'Kindly confirm attendance.',
      },
    })

    // Direct success
    mockGenerate.mockResolvedValueOnce({
      success: true,
      text: validInv,
      model: 'gemini-3.8-flash',
    })

    const directResult = await runAiTask({
      task: 'invitation',
      plan,
      tone: 'formal',
      language: 'en',
    })
    expect(directResult.ok).toBe(true)
    expect(directResult.source).toBe('gemini')

    // Repair success
    mockGenerate
      .mockResolvedValueOnce({
        success: true,
        text: '{"corrupt',
        model: 'gemini-3.8-flash',
      })
      .mockResolvedValueOnce({
        success: true,
        text: validInv,
        model: 'gemini-3.8-flash',
      })

    const repairResult = await runAiTask({
      task: 'invitation',
      plan,
      tone: 'formal',
      language: 'en',
    })
    expect(repairResult.ok).toBe(true)
    expect(repairResult.source).toBe('gemini')
  })

  it('executes run_of_show task with repair flow and fallback', async () => {
    const validRunOfShow = JSON.stringify({
      items: [
        {
          time: '10:00 AM',
          title: 'Guest Reception',
          detail: 'Welcome drinks and registration.',
        },
      ],
    })

    // Repair flow
    mockGenerate
      .mockResolvedValueOnce({
        success: true,
        text: 'invalid json',
        model: 'gemini-3.8-flash',
      })
      .mockResolvedValueOnce({
        success: true,
        text: validRunOfShow,
        model: 'gemini-3.8-flash',
      })

    const repairResult = await runAiTask({
      task: 'run_of_show',
      plan,
    })
    expect(repairResult.ok).toBe(true)
    expect(repairResult.source).toBe('gemini')

    // Fallback when repair fails
    mockGenerate.mockResolvedValue({
      success: false,
      error: { code: 'quota', retryable: true, message: 'Rate limit' },
    })

    const fallbackResult = await runAiTask({
      task: 'run_of_show',
      plan,
    })
    expect(fallbackResult.ok).toBe(true)
    expect(fallbackResult.source).toBe('template')
    expect(
      (fallbackResult.data as { items: unknown[] }).items.length
    ).toBeGreaterThan(0)
  })
})
