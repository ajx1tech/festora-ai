import {
  checkRateLimit,
  cleanupExpired,
  getClientIdentifier,
  hashClientKey,
  resetRateLimitStore,
} from '@/lib/ai/rateLimit'

describe('rateLimit', () => {
  const baseTime = 1700000000000 // Fixed epoch

  beforeEach(() => {
    resetRateLimitStore()
  })

  it('allows up to 20 requests per client key within a 10 minute window', () => {
    const key = hashClientKey('192.168.1.10')

    for (let i = 0; i < 20; i += 1) {
      const result = checkRateLimit(key, baseTime + i * 1000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(19 - i)
    }

    // 21st request should be rejected
    const blocked = checkRateLimit(key, baseTime + 20 * 1000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect(blocked.remaining).toBe(0)
  })

  it('enforces per-key isolation', () => {
    const clientA = hashClientKey('10.0.0.1')
    const clientB = hashClientKey('10.0.0.2')

    // Exhaust client A
    for (let i = 0; i < 20; i += 1) {
      checkRateLimit(clientA, baseTime + i * 1000)
    }
    const blockedA = checkRateLimit(clientA, baseTime + 20 * 1000)
    expect(blockedA.allowed).toBe(false)

    // Client B should remain completely unblocked
    const allowedB = checkRateLimit(clientB, baseTime + 20 * 1000)
    expect(allowedB.allowed).toBe(true)
    expect(allowedB.remaining).toBe(19)
  })

  it('resets capacity after sliding window expires (10 minutes)', () => {
    const key = hashClientKey('192.168.1.50')

    for (let i = 0; i < 20; i += 1) {
      checkRateLimit(key, baseTime + i * 1000)
    }

    // Advance time past the entire 10-minute window for all 20 previous requests
    const futureTime = baseTime + 20 * 1000 + 10 * 60 * 1000 + 1000
    const resultAfterWindow = checkRateLimit(key, futureTime)

    expect(resultAfterWindow.allowed).toBe(true)
    expect(resultAfterWindow.remaining).toBe(19)
  })

  it('cleans up fully expired entries from memory store', () => {
    const key = hashClientKey('10.20.30.40')
    checkRateLimit(key, baseTime)

    // Advance time by 11 minutes and run cleanup
    const afterWindow = baseTime + 11 * 60 * 1000
    const evicted = cleanupExpired(afterWindow)

    expect(evicted).toBe(1)
  })

  it('extracts client identifier from x-forwarded-for or x-real-ip headers', () => {
    const headersForwarded = {
      get: (h: string) =>
        h === 'x-forwarded-for' ? '203.0.113.195, 70.41.3.18' : null,
    }
    expect(getClientIdentifier(headersForwarded)).toBe('203.0.113.195')

    const headersRealIp = {
      get: (h: string) => (h === 'x-real-ip' ? '198.51.100.1' : null),
    }
    expect(getClientIdentifier(headersRealIp)).toBe('198.51.100.1')

    const emptyHeaders = { get: () => null }
    expect(getClientIdentifier(emptyHeaders)).toBe('127.0.0.1')
  })
})
