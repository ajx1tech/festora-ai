import nextConfig from '@/next.config'

describe('Security Headers Configuration', () => {
  it('defines poweredByHeader as false and reactStrictMode as true', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
    expect(nextConfig.reactStrictMode).toBe(true)
  })

  it('configures strict security headers for all routes', async () => {
    expect(typeof nextConfig.headers).toBe('function')
    if (!nextConfig.headers) return

    const routeHeaders = await nextConfig.headers()
    expect(routeHeaders).toHaveLength(1)

    const globalRoute = routeHeaders[0]
    expect(globalRoute.source).toBe('/:path*')

    const headerMap = Object.fromEntries(
      globalRoute.headers.map((h) => [h.key, h.value])
    )

    expect(headerMap['Content-Security-Policy']).toContain("default-src 'self'")
    expect(headerMap['Content-Security-Policy']).toContain(
      "frame-ancestors 'none'"
    )
    expect(headerMap['X-Content-Type-Options']).toBe('nosniff')
    expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headerMap['Permissions-Policy']).toBe(
      'camera=(), microphone=(), geolocation=()'
    )
    expect(headerMap['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains'
    )
  })
})
