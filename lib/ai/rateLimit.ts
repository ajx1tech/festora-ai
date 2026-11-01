import { createHash } from 'crypto'

/**
 * ARCHITECTURAL NOTE ON SERVERLESS RATE LIMITING:
 * In a serverless deployment environment (e.g. Vercel, AWS Lambda), individual worker instances
 * do not share memory. Consequently, this in-memory sliding-window limiter provides best-effort,
 * single-instance abuse prevention designed for hackathon and demo environments. Production scale
 * across distributed regions would replace or supplement this with an edge-tier Redis/Upstash store.
 */

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
  remaining: number
}

const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS = 20
const MAX_MAP_SIZE = 5000

// In-memory sliding window store: Key -> array of timestamp integers
const rateLimitStore = new Map<string, number[]>()
let lastCleanup = 0

/**
 * Hashes client IP or network identifier to avoid retaining raw PII in server memory.
 *
 * @param rawIp - Untrusted IP address string from request headers.
 * @returns Anonymized SHA-256 hex string identifying the client key.
 */
export function hashClientKey(rawIp: string): string {
  return createHash('sha256')
    .update(rawIp.trim().toLowerCase())
    .digest('hex')
    .substring(0, 16)
}

/**
 * Extracts client IP identifier from standard proxy headers.
 *
 * @param headers - HTTP Headers or Header-like object.
 * @returns Client identifier string (defaults to '127.0.0.1' if absent).
 */
export function getClientIdentifier(headers: {
  get(name: string): string | null
}): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const firstHop = forwarded.split(',')[0].trim()
    if (firstHop.length > 0) {
      return firstHop
    }
  }

  const realIp = headers.get('x-real-ip')
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim()
  }

  return '127.0.0.1'
}

/**
 * Evaluates whether a request from a given client key is permitted under the 20 req/10 min policy.
 *
 * @param clientKey - Anonymized client identifier key.
 * @param nowMs - Optional current epoch time in milliseconds (defaults to Date.now()).
 * @returns RateLimitResult with allowed flag, remaining capacity, and retry delay.
 */
export function checkRateLimit(
  clientKey: string,
  nowMs: number = Date.now()
): RateLimitResult {
  // Periodic memory hygiene: clean expired entries every 2 minutes or when map swells
  if (
    nowMs - lastCleanup > 2 * 60 * 1000 ||
    rateLimitStore.size > MAX_MAP_SIZE
  ) {
    cleanupExpired(nowMs)
    lastCleanup = nowMs
  }

  const cutoff = nowMs - WINDOW_MS
  const history = rateLimitStore.get(clientKey) ?? []
  const activeTimestamps = history.filter((t) => t > cutoff)

  if (activeTimestamps.length < MAX_REQUESTS) {
    activeTimestamps.push(nowMs)
    rateLimitStore.set(clientKey, activeTimestamps)
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: MAX_REQUESTS - activeTimestamps.length,
    }
  }

  // Rate limit exceeded: calculate delay until the oldest request exits the sliding window
  const oldest = activeTimestamps[0]
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((oldest + WINDOW_MS - nowMs) / 1000)
  )

  return {
    allowed: false,
    retryAfterSeconds,
    remaining: 0,
  }
}

/**
 * Removes expired sliding-window records from memory to prevent unbound heap growth.
 *
 * @param nowMs - Current epoch timestamp.
 * @returns Count of evicted entries.
 */
export function cleanupExpired(nowMs: number = Date.now()): number {
  const cutoff = nowMs - WINDOW_MS
  let evicted = 0

  for (const [key, timestamps] of rateLimitStore.entries()) {
    const active = timestamps.filter((t) => t > cutoff)
    if (active.length === 0) {
      rateLimitStore.delete(key)
      evicted += 1
    } else {
      rateLimitStore.set(key, active)
    }
  }

  return evicted
}

/**
 * Clears the rate limit store (for test suites).
 *
 * @returns Void.
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear()
  lastCleanup = 0
}
