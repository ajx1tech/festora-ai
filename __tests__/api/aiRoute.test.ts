/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ai/route'
import { resetRateLimitStore } from '@/lib/ai/rateLimit'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('POST /api/ai Route Handler', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')
  const samples = createSampleProfiles(fixedNow)
  const plan = createPlanFromProfile(samples.wedding, fixedNow)

  beforeEach(() => {
    resetRateLimitStore()
  })

  it('returns 400 for invalid JSON syntax', async () => {
    const req = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-text',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid JSON request payload')
  })

  it('returns 400 for invalid schema parameters', async () => {
    const req = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'unknown_task' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid request parameters')
  })

  it('returns 413 for oversized payloads (> 20KB)', async () => {
    const massiveNotes = 'X'.repeat(25 * 1024)
    const req = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(massiveNotes.length),
      },
      body: JSON.stringify({ task: 'ideas', plan, notes: massiveNotes }),
    })

    const res = await POST(req)
    expect(res.status).toBe(413)
    const json = await res.json()
    expect(json.error).toBe('Payload too large')
  })

  it('returns 429 with Retry-After when rate limit is exceeded', async () => {
    const validPayload = JSON.stringify({
      task: 'ideas',
      plan,
    })

    // Issue 20 requests from the same IP
    for (let i = 0; i < 20; i += 1) {
      const req = new Request('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.5',
        },
        body: validPayload,
      })
      const res = await POST(req)
      expect(res.status).toBe(200)
    }

    // 21st request should be rejected with 429
    const blockedReq = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.5',
      },
      body: validPayload,
    })

    const blockedRes = await POST(blockedReq)
    expect(blockedRes.status).toBe(429)
    expect(blockedRes.headers.get('Retry-After')).toBeTruthy()
    const json = await blockedRes.json()
    expect(json.error).toContain('Too many requests')
  })

  it('returns 200 with valid AiEnvelope and no-store cache header on valid request', async () => {
    const validReq = new Request('http://localhost:3000/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.77',
      },
      body: JSON.stringify({
        task: 'ideas',
        plan,
      }),
    })

    const res = await POST(validReq)
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')

    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.source).toBeDefined()
    expect(json.data).toBeDefined()

    // Assert response contains no secret API key or internal stack traces
    const stringified = JSON.stringify(json)
    expect(stringified).not.toContain('AIzaSy')
    expect(stringified).not.toContain('GEMINI_API_KEY')
  })
})
