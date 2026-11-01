'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { usePlannerStore } from '@/lib/store/plannerStore'
import { CalendarHeart, Cake, Users, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { EventType } from '@/lib/domain/schemas'

export interface SampleDemoProps {
  className?: string
  showHeading?: boolean
  onLoaded?: () => void
}

/**
 * Quick sample loader component allowing users or evaluators to test Festora AI
 * with rich, realistic celebration blueprints in one single click.
 *
 * @param props - Component configuration.
 * @returns Accessible sample event selection cards.
 */
export function SampleDemo({
  className = '',
  showHeading = true,
  onLoaded,
}: SampleDemoProps): React.ReactElement {
  const { loadSample } = usePlannerStore()
  const router = useRouter()

  const handleLoad = (type: EventType): void => {
    loadSample(type)
    if (onLoaded) {
      onLoaded()
    } else {
      router.push('/planner')
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showHeading && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
          <span>Or evaluate with a ready-made celebration</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto py-3 px-3.5 flex flex-col items-start text-left rounded-xl border-[var(--border-subtle)] hover:border-[var(--color-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          onClick={() => handleLoad('wedding')}
          aria-label="Load sample Maharashtrian Wedding (250 guests, INR 25 Lakhs)"
        >
          <div className="flex items-center gap-2 mb-1 w-full text-rose-600 dark:text-rose-400">
            <CalendarHeart className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide">Wedding Demo</span>
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
            Ananya & Rohan
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5">
            250 guests &bull; Pune (INR)
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-auto py-3 px-3.5 flex flex-col items-start text-left rounded-xl border-[var(--border-subtle)] hover:border-[var(--color-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          onClick={() => handleLoad('birthday')}
          aria-label="Load sample 30th Birthday Soiree (40 guests, USD 6,000)"
        >
          <div className="flex items-center gap-2 mb-1 w-full text-amber-600 dark:text-amber-400">
            <Cake className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide">Birthday Demo</span>
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
            Marcus 30th Soiree
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5">
            40 guests &bull; SF (USD)
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-auto py-3 px-3.5 flex flex-col items-start text-left rounded-xl border-[var(--border-subtle)] hover:border-[var(--color-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          onClick={() => handleLoad('community')}
          aria-label="Load sample Diwali Community Mela (600 guests, INR 7.5 Lakhs)"
        >
          <div className="flex items-center gap-2 mb-1 w-full text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide">Community Demo</span>
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
            Diwali Utsav Mela
          </span>
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5">
            600 guests &bull; Mumbai (INR)
          </span>
        </Button>
      </div>
    </div>
  )
}
