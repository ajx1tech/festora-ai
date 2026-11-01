'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Toast } from '@/components/ui/Toast'
import { callAi } from '@/lib/ai/aiClient'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import type { RunOfShowResponse } from '@/lib/ai/aiSchemas'
import type { RunOfShowItem } from '@/lib/domain/schemas'
import { fallbackRunOfShow } from '@/lib/engines/fallbackContent'
import {
  CalendarClock,
  Copy,
  Printer,
  RotateCw,
  ShieldAlert,
} from 'lucide-react'

/**
 * Event-day schedule orchestrator displaying a minute-by-minute itinerary
 * with editable milestone titles, clipboard export, and print formatting.
 *
 * @returns Run of Show tab view.
 */
export function RunOfShowTab(): React.ReactElement {
  const activePlan = useActivePlan()
  const { setRunOfShow } = usePlannerStore()

  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [source, setSource] = useState<'gemini' | 'template'>('template')
  const [cooldown, setCooldown] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Use items from plan.runOfShow if available, otherwise deterministic fallback
  const fallbackItems = activePlan ? fallbackRunOfShow(activePlan.profile) : []
  const items: RunOfShowItem[] =
    activePlan?.runOfShow && activePlan.runOfShow.length > 0
      ? activePlan.runOfShow
      : fallbackItems

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Fetch or regenerate run-of-show
  const fetchRunOfShow = async (): Promise<void> => {
    if (!activePlan) return
    setLoading(true)
    setStatusText('Festora is constructing your event day timeline...')

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await callAi<RunOfShowResponse>({
        task: 'run_of_show',
        plan: activePlan,
      })

      if (response && response.data) {
        setRunOfShow(response.data.items)
        setSource(response.source)
        setStatusText(
          response.source === 'gemini'
            ? 'Event day schedule generated with Gemini AI.'
            : 'Event day schedule loaded from proven celebration itineraries.'
        )
      }
    } catch {
      setStatusText('Using offline schedule itinerary.')
      setSource('template')
    } finally {
      setLoading(false)
      setCooldown(10)
    }
  }

  // Cancel generation
  const handleCancel = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLoading(false)
    setStatusText('Generation cancelled.')
  }

  // Save edited title
  const handleSaveTitle = (idx: number): void => {
    if (!editingTitle.trim()) {
      setEditingIndex(null)
      return
    }

    const nextItems = items.map((it, i) =>
      i === idx ? { ...it, title: editingTitle.trim() } : it
    )
    setRunOfShow(nextItems)
    setEditingIndex(null)
    setToastMessage('Schedule title updated.')
  }

  // Copy schedule as plain text
  const handleCopy = async (): Promise<void> => {
    if (items.length === 0) return
    const formatted = items
      .map((it) => `${it.time} - ${it.title}\n${it.detail}\n`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(formatted)
      setToastMessage('Schedule itinerary copied to clipboard!')
    } catch {
      setToastMessage('Could not copy schedule.')
    }
  }

  // Print schedule
  const handlePrint = (): void => {
    window.print()
  }

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading run of show...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ARIA Live status region */}
      <div className="sr-only" aria-live="polite">
        {statusText}
      </div>

      {/* Header Card */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
                Day-of Event Run of Show Schedule
              </h2>
              <SourceBadge source={source} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Chronological day-of itinerary coordinating bridal prep, vendor arrivals, ceremony cues, and reception toasts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={loading || items.length === 0}
              className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              <span>Copy</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading || items.length === 0}
              className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              <span>Print</span>
            </Button>

            {loading ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cooldown > 0}
                onClick={() => void fetchRunOfShow()}
                className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
                aria-label={cooldown > 0 ? `Regenerate available in ${cooldown}s` : 'Regenerate schedule'}
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${cooldown > 0 ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Regenerate'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Avoid sensitive personal data. Free-tier AI may be reviewed by Google.</span>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <span className="text-xs text-[var(--text-muted)] animate-pulse block text-center">
            Festora is sequencing your event day itinerary...
          </span>
        </div>
      ) : (
        /* Accessible Run of Show Table */
        <Card variant="surface" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="sr-only">
                Event Day Run of Show Schedule for {activePlan.profile.name}
              </caption>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-bold">
                  <th scope="col" className="p-3.5 pl-6 w-32">Time</th>
                  <th scope="col" className="p-3.5 w-64">Milestone / Cue</th>
                  <th scope="col" className="p-3.5 pr-6">Operational Details & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {items.map((item, idx) => {
                  const isEditing = editingIndex === idx

                  return (
                    <tr key={idx} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                      {/* Time Column */}
                      <td className="p-3.5 pl-6 font-semibold text-[var(--color-primary)] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{item.time}</span>
                        </div>
                      </td>

                      {/* Milestone Title (Editable) */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(idx)
                                if (e.key === 'Escape') setEditingIndex(null)
                              }}
                              autoFocus
                              className="px-2 py-1 text-xs rounded-lg border border-[var(--color-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                              aria-label={`Edit title for ${item.time}`}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              className="px-2 py-1 text-[11px] h-auto"
                              onClick={() => handleSaveTitle(idx)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(idx)
                              setEditingTitle(item.title)
                            }}
                            className="font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] hover:underline text-left transition-colors"
                            title="Click to edit title"
                            aria-label={`Milestone: ${item.title}. Click to edit.`}
                          >
                            {item.title}
                          </button>
                        )}
                      </td>

                      {/* Operational Details */}
                      <td className="p-3.5 pr-6 text-xs text-[var(--text-secondary)] leading-relaxed">
                        {item.detail}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}
    </div>
  )
}
