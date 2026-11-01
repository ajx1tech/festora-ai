import { NextResponse } from 'next/server'
import { getModelChain, hasApiKey } from '@/lib/ai/config'

export const dynamic = 'force-dynamic'

/**
 * Health check endpoint reporting service operational status and model chain availability.
 * Never exposes secrets, keys, or internal environment parameters.
 *
 * @returns JSON health response with Cache-Control: no-store.
 */
export async function GET(): Promise<Response> {
  const isConfigured = hasApiKey()
  const models = getModelChain()

  return NextResponse.json(
    {
      status: 'ok',
      aiConfigured: isConfigured,
      models,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
