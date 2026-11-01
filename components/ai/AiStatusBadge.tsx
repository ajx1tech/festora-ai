'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, ShieldCheck } from 'lucide-react'

export interface HealthResponse {
  status: string
  aiConfigured: boolean
  models: string[]
}

/**
 * Header badge indicating whether server-side Gemini integration is active or running offline templates.
 * Invokes /api/health once on mount without exposing keys or internal environment parameters.
 *
 * @returns Accessible status indicator badge.
 */
export function AiStatusBadge(): React.ReactElement {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [primaryModel, setPrimaryModel] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkHealth(): Promise<void> {
      try {
        const res = await fetch('/api/health')
        if (!res.ok) {
          if (isMounted) setConfigured(false)
          return
        }
        const data = (await res.json()) as HealthResponse
        if (isMounted) {
          setConfigured(Boolean(data.aiConfigured))
          if (data.models && data.models.length > 0) {
            setPrimaryModel(data.models[0])
          }
        }
      } catch {
        if (isMounted) setConfigured(false)
      }
    }

    void checkHealth()

    return () => {
      isMounted = false
    }
  }, [])

  if (configured === null) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
        aria-label="Checking AI service status"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span>Checking AI...</span>
      </div>
    )
  }

  if (configured) {
    const tooltipText = primaryModel
      ? `Gemini AI connected (${primaryModel})`
      : 'Gemini AI connected'

    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
        <span>Gemini connected</span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
      title="Offline deterministic templates active (zero cloud AI dependency)"
      aria-label="Offline templates active"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
      <span>Offline templates</span>
    </div>
  )
}
