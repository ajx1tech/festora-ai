/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns 200 with service status and model chain without secrets', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')

    const data = await res.json()
    expect(data.status).toBe('ok')
    expect(typeof data.aiConfigured).toBe('boolean')
    expect(Array.isArray(data.models)).toBe(true)
    expect(data.models.length).toBeGreaterThan(0)

    const str = JSON.stringify(data)
    expect(str).not.toContain('GEMINI_API_KEY')
    expect(str).not.toContain('AIzaSy')
  })
})
