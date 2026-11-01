import { getApiKey, getModelChain, hasApiKey } from '@/lib/ai/config'

export type GeminiErrorCode =
  'no_key' | 'auth' | 'quota' | 'timeout' | 'blocked' | 'upstream'

export interface GeminiError {
  code: GeminiErrorCode
  retryable: boolean
  message: string
}

export type GeminiResult =
  | { success: true; text: string; model: string }
  | { success: false; error: GeminiError }

export interface GenerateOptions {
  system: string
  user: string
  json?: boolean
  maxOutputTokens?: number
  temperature?: number
  signal?: AbortSignal
}

interface GeminiCandidatePart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiCandidatePart[]
  }
  finishReason?: string
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
  promptFeedback?: {
    blockReason?: string
  }
  error?: {
    code?: number
    message?: string
    status?: string
  }
}

/**
 * Invokes the Google Gemini REST API using a prioritized model chain and per-attempt timeouts.
 * Never exposes the API key or raw upstream response bodies to callers.
 *
 * @param options - Generation options including system prompt, user prompt, and generation parameters.
 * @returns Standardized GeminiResult with extracted text or sanitized error.
 */
export async function generateContent(
  options: GenerateOptions
): Promise<GeminiResult> {
  if (!hasApiKey()) {
    return {
      success: false,
      error: {
        code: 'no_key',
        retryable: false,
        message: 'AI service key is unconfigured on the server.',
      },
    }
  }

  const apiKey = getApiKey()!
  // Maximum 2 attempts per request to ensure execution fits within route budget
  const models = getModelChain().slice(0, 2)
  let lastError: GeminiError = {
    code: 'upstream',
    retryable: true,
    message: 'AI generation service failed.',
  }

  for (const model of models) {
    if (options.signal?.aborted) {
      return {
        success: false,
        error: {
          code: 'timeout',
          retryable: false,
          message: 'Request was cancelled by client.',
        },
      }
    }

    const controller = new AbortController()
    // 12 second per-attempt timeout
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const onCallerAbort = (): void => {
      controller.abort()
    }
    options.signal?.addEventListener('abort', onCallerAbort)

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`

      const payload = {
        systemInstruction: {
          parts: [{ text: options.system }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: options.user }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: Math.max(4096, options.maxOutputTokens ?? 4096),
          ...(options.json ? { responseMimeType: 'application/json' } : {}),
        },
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      // Immediate non-retryable auth failures
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: {
            code: 'auth',
            retryable: false,
            message: 'Authentication credentials for AI service are invalid.',
          },
        }
      }

      if (res.status === 429) {
        lastError = {
          code: 'quota',
          retryable: true,
          message: 'Upstream rate limit or quota exceeded.',
        }
        continue
      }

      if (!res.ok) {
        lastError = {
          code: 'upstream',
          retryable: true,
          message: `Model ${model} returned service status ${res.status}.`,
        }
        continue
      }

      const data = (await res.json()) as GeminiResponse

      // Check for prompt level block
      if (data.promptFeedback?.blockReason) {
        lastError = {
          code: 'blocked',
          retryable: true,
          message: 'Prompt content was flagged by content safety filter.',
        }
        continue
      }

      const candidate = data.candidates?.[0]
      if (!candidate) {
        lastError = {
          code: 'upstream',
          retryable: true,
          message: 'Model returned zero content candidates.',
        }
        continue
      }

      // Check finish reason for safety blocks
      if (
        candidate.finishReason &&
        candidate.finishReason !== 'STOP' &&
        candidate.finishReason !== 'MAX_TOKENS'
      ) {
        lastError = {
          code: 'blocked',
          retryable: true,
          message: `Generation halted due to finishReason: ${candidate.finishReason}.`,
        }
        continue
      }

      const text = (candidate.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')

      if (!text || text.trim().length === 0) {
        lastError = {
          code: 'upstream',
          retryable: true,
          message: 'Model returned empty response text.',
        }
        continue
      }

      return {
        success: true,
        text,
        model,
      }
    } catch (err: unknown) {
      const isAbort =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.includes('aborted'))
      if (isAbort) {
        lastError = {
          code: 'timeout',
          retryable: true,
          message: `Attempt with model ${model} timed out after 12 seconds.`,
        }
      } else {
        lastError = {
          code: 'upstream',
          retryable: true,
          message: 'Network error communicating with AI endpoint.',
        }
      }
    } finally {
      clearTimeout(timeoutId)
      options.signal?.removeEventListener('abort', onCallerAbort)
    }
  }

  return {
    success: false,
    error: lastError,
  }
}
