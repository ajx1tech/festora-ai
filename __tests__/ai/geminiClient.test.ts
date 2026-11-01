import { generateContent } from '@/lib/ai/geminiClient'

describe('geminiClient', () => {
  const originalEnv = process.env
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    process.env = { ...originalEnv }
    originalFetch = global.fetch
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    process.env.GEMINI_MODELS = 'gemini-model-primary,gemini-model-secondary'
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns no_key error immediately when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY
    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('no_key')
      expect(result.error.retryable).toBe(false)
    }
  })

  it('succeeds on first model with extracted text', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: { parts: [{ text: '{"result": "success"}' }] },
            finishReason: 'STOP',
          },
        ],
      }),
    } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
      json: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.text).toBe('{"result": "success"}')
      expect(result.model).toBe('gemini-model-primary')
    }
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('moves to second model on 429 quota error and succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Quota exceeded' } }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Second model output' }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.text).toBe('Second model output')
      expect(result.model).toBe('gemini-model-secondary')
    }
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('moves to second model on 404 model not found and succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Model not found' } }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Fallback model succeeded' }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.text).toBe('Fallback model succeeded')
      expect(result.model).toBe('gemini-model-secondary')
    }
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('returns auth error on 401 without retrying second model', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'API key not valid' } }),
    } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('auth')
      expect(result.error.retryable).toBe(false)
    }
    // Auth failures must not be retried across subsequent models
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('returns auth error on 403 without retrying second model', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Permission denied' } }),
    } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('auth')
      expect(result.error.retryable).toBe(false)
    }
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('moves on when candidate finishReason is blocked or safety-triggered', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ finishReason: 'SAFETY' }],
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Clean unblocked output' }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.text).toBe('Clean unblocked output')
      expect(result.model).toBe('gemini-model-secondary')
    }
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('handles abort timeout on first model and succeeds on second', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('This operation was aborted'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Second attempt succeeded' }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.text).toBe('Second attempt succeeded')
    }
  })

  it('returns failure when all models fail', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal error' } }),
    } as unknown as Response)

    const result = await generateContent({
      system: 'system prompt',
      user: 'user prompt',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('upstream')
      expect(result.error.retryable).toBe(true)
    }
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
