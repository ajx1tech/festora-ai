'use client'

import { useCallback, useState } from 'react'
import type {
  AiEnvelope,
  AiRequest,
  ChatResponse,
  IdeasResponse,
  InvitationResponse,
  RunOfShowResponse,
  VendorMessageResponse,
} from '@/lib/ai/aiSchemas'
import {
  fallbackChatAnswer,
  fallbackIdeas,
  fallbackInvitation,
  fallbackRunOfShow,
  fallbackVendorMessage,
} from '@/lib/engines/fallbackContent'

/**
 * Computes client-side local fallback data when the server or network is completely unavailable.
 *
 * @param request - Inbound AI request payload.
 * @returns Standardized local fallback response data.
 */
export function getLocalFallbackData(request: AiRequest): unknown {
  switch (request.task) {
    case 'ideas': {
      const bundle = fallbackIdeas(request.plan.profile)
      const data: IdeasResponse = {
        concept: bundle.concept ?? 'A joyful family celebration.',
        themes: bundle.themes ?? [
          'Classic Elegance',
          'Vibrant Festive',
          'Warm Botanical',
        ],
        ideas: (bundle.ideas ?? []).map((title, idx) => ({
          title,
          description:
            'Culturally curated celebratory concept focusing on guest hospitality.',
          estimatedCostBand:
            idx % 3 === 0 ? 'low' : idx % 3 === 1 ? 'mid' : 'high',
          category: idx % 2 === 0 ? 'decor' : 'catering',
        })),
        savingTips: bundle.savingTips ?? [
          'Choose seasonal flowers to reduce floral expenses.',
        ],
      }
      return data
    }
    case 'chat': {
      const fb = fallbackChatAnswer(request.message, request.plan)
      const data: ChatResponse = { answer: fb.answer }
      return data
    }
    case 'vendor_message': {
      const targetVendor = request.plan.vendors.find(
        (v) => v.id === request.vendorId
      ) ?? {
        id: request.vendorId,
        category: 'general',
        name: 'Vendor',
        status: 'researching',
        quote: 0,
        notes: '',
      }
      const fb = fallbackVendorMessage(request.plan.profile, targetVendor)
      const data: VendorMessageResponse = {
        subject: fb.subject,
        message: fb.message,
      }
      return data
    }
    case 'invitation': {
      const vA = fallbackInvitation(
        request.plan.profile,
        request.tone,
        request.language
      )
      const vB = fallbackInvitation(
        request.plan.profile,
        request.tone === 'formal' ? 'warm' : 'formal',
        request.language
      )
      const data: InvitationResponse = {
        variantA: { title: vA.title, body: vA.body, rsvp: vA.rsvp },
        variantB: { title: vB.title, body: vB.body, rsvp: vB.rsvp },
      }
      return data
    }
    case 'run_of_show': {
      const items = fallbackRunOfShow(request.plan.profile)
      const data: RunOfShowResponse = {
        items: items.map((it) => ({
          time: it.time,
          title: it.title,
          detail: it.detail,
        })),
      }
      return data
    }
  }
}

/**
 * Browser-side client helper that invokes the server /api/ai endpoint.
 * Seamlessly falls back to local deterministic templates if network or server errors arise.
 *
 * @param request - Polymorphic AI request payload.
 * @returns Validated AiEnvelope containing data and honest source attribution.
 */
export async function callAi<T = unknown>(
  request: AiRequest
): Promise<AiEnvelope<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('HTTP 429: Rate limit exceeded')
      }
      // Server returned other error (e.g. 500) -> fall back locally
      const fallbackData = getLocalFallbackData(request) as T
      return {
        ok: true,
        source: 'template',
        data: fallbackData,
      }
    }

    const envelope = (await res.json()) as AiEnvelope<T>
    return envelope
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('429')) {
      throw err
    }
    // Network offline or fetch abort -> fallback locally
    const fallbackData = getLocalFallbackData(request) as T
    return {
      ok: true,
      source: 'template',
      data: fallbackData,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export interface UseAiState<T> {
  loading: boolean
  error: string | null
  data: T | null
  source: 'gemini' | 'template' | null
  model: string | null
  statusText: string
  run: (request: AiRequest) => Promise<T>
}

/**
 * React hook providing accessible state management for asynchronous AI generation tasks.
 * Includes ARIA live status announcements for screen readers.
 *
 * @returns State and execute callback for AI operations.
 */
export function useAi<T = unknown>(): UseAiState<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [source, setSource] = useState<'gemini' | 'template' | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Idle')

  const run = useCallback(async (request: AiRequest): Promise<T> => {
    setLoading(true)
    setError(null)
    setStatusText('Generating customized event content...')

    try {
      const response = await callAi<T>(request)
      setData(response.data)
      setSource(response.source)
      setModel(response.model ?? null)

      if (response.source === 'gemini') {
        setStatusText('Content successfully generated with AI.')
      } else {
        setStatusText('Content generated using offline planning templates.')
      }

      return response.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setError(message)
      setStatusText(`Error: ${message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    source,
    model,
    statusText,
    run,
  }
}
