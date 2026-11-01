import { NextResponse } from 'next/server'
import { AiRequestSchema } from '@/lib/ai/aiSchemas'
import { runAiTask } from '@/lib/ai/orchestrator'
import {
  checkRateLimit,
  getClientIdentifier,
  hashClientKey,
} from '@/lib/ai/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_PAYLOAD_BYTES = 20 * 1024 // 20 KB limit

/**
 * Handles server-side AI requests with rate limiting, payload size caps, and error isolation.
 *
 * @param req - Inbound Next.js Request object.
 * @returns JSON response containing validated AiEnvelope or standardized HTTP error.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Content-Length Header Guard
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 2. Read and verify raw body buffer size
    const rawBody = await req.text()
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 3. Safe JSON parsing
    let jsonBody: unknown
    try {
      jsonBody = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 4. Schema validation with generic non-leaking message
    const parsed = AiRequestSchema.safeParse(jsonBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 5. Rate limiting per client network key
    const clientIp = getClientIdentifier(req.headers)
    const clientKey = hashClientKey(clientIp)
    const limit = checkRateLimit(clientKey)

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(limit.retryAfterSeconds),
          },
        }
      )
    }

    // 6. Execute task via resilient orchestrator
    const envelope = await runAiTask(parsed.data)

    return NextResponse.json(envelope, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    // Isolated internal error handling: never leak stack traces, user text, or secrets
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
