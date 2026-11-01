/**
 * Default prioritized fallback chain of Gemini models.
 */
export const DEFAULT_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
]

/**
 * Retrieves the configured model chain from environment variables.
 *
 * @returns Ordered array of model names to attempt sequentially.
 */
export function getModelChain(): string[] {
  const envModels = process.env.GEMINI_MODELS
  if (!envModels || envModels.trim().length === 0) {
    return [...DEFAULT_GEMINI_MODELS]
  }

  const parsed = envModels
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0)

  return parsed.length > 0 ? parsed : [...DEFAULT_GEMINI_MODELS]
}

/**
 * Checks whether the server environment possesses a non-empty Gemini API key.
 *
 * @returns True if GEMINI_API_KEY is configured on the server.
 */
export function hasApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY
  return Boolean(key && key.trim().length > 0)
}

/**
 * Retrieves the server-only Gemini API key without exposing it in logs.
 *
 * @returns The raw API key string or undefined if unconfigured.
 */
export function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY
  if (!key || key.trim().length === 0) {
    return undefined
  }
  return key.trim()
}
