import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AiStatusBadge } from '@/components/ai/AiStatusBadge'

describe('AiStatusBadge component', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('displays Gemini connected when /api/health returns aiConfigured true', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        aiConfigured: true,
        models: ['gemini-3.8-flash'],
      }),
    }) as jest.Mock

    render(<AiStatusBadge />)

    await waitFor(() => {
      expect(screen.getByText('Gemini connected')).toBeInTheDocument()
    })
  })

  it('displays Offline templates when /api/health returns aiConfigured false', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        aiConfigured: false,
        models: [],
      }),
    }) as jest.Mock

    render(<AiStatusBadge />)

    await waitFor(() => {
      expect(screen.getByText('Offline templates')).toBeInTheDocument()
    })
  })

  it('falls back to Offline templates gracefully on network error', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error')) as jest.Mock

    render(<AiStatusBadge />)

    await waitFor(() => {
      expect(screen.getByText('Offline templates')).toBeInTheDocument()
    })
  })
})
