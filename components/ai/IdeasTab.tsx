'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Toast } from '@/components/ui/Toast'
import { callAi } from '@/lib/ai/aiClient'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import { generateId } from '@/lib/utils/ids'
import type { IdeasResponse } from '@/lib/ai/aiSchemas'
import type { Task } from '@/lib/domain/schemas'
import {
  Sparkles,
  PiggyBank,
  Plus,
  RotateCw,
  ShieldAlert,
} from 'lucide-react'
import { fallbackIdeas } from '@/lib/engines/fallbackContent'

/**
 * AI-powered celebration ideas & design themes tab with instant caching,
 * one-click timeline task conversion, and 10-second regenerate cooldown.
 *
 * @returns Ideas tab view.
 */
export function IdeasTab(): React.ReactElement {
  const activePlan = useActivePlan()
  const { setAiBundle, addTask } = usePlannerStore()

  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [source, setSource] = useState<'gemini' | 'template'>('template')
  const [notes, setNotes] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Derived state from store cache or deterministic fallback
  const [bundleData, setBundleData] = useState<IdeasResponse | null>(() => {
    const b = activePlan?.aiBundle ?? (activePlan ? fallbackIdeas(activePlan.profile) : null)
    if (b) {
      return {
        concept: b.concept ?? '',
        themes: b.themes ?? [],
        ideas: (b.ideas ?? []).map((ideaText, idx) => ({
          title: ideaText,
          description: 'Personalized celebration inspiration curated for your guests and venue.',
          estimatedCostBand: idx % 3 === 0 ? 'low' : idx % 3 === 1 ? 'mid' : 'high',
          category: idx % 2 === 0 ? 'decor' : 'hospitality',
        })),
        savingTips: b.savingTips ?? [],
      }
    }
    return null
  })

  // Timer cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Run AI Ideas generation
  const fetchIdeas = async (customNotes?: string): Promise<void> => {
    if (!activePlan) return
    setLoading(true)
    setStatusText('Festora is crafting creative celebration ideas...')

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await callAi<IdeasResponse>({
        task: 'ideas',
        plan: activePlan,
        notes: (customNotes ?? notes).trim() || undefined,
      })

      if (response && response.data) {
        setBundleData(response.data)
        setSource(response.source)

        // Cache into store
        setAiBundle({
          concept: response.data.concept,
          themes: response.data.themes,
          ideas: response.data.ideas.map((i) => i.title),
          savingTips: response.data.savingTips,
          source: response.source,
          model: response.model ?? null,
          generatedAtISO: new Date().toISOString(),
        })

        setStatusText(
          response.source === 'gemini'
            ? 'Ideas successfully crafted with Gemini AI.'
            : 'Ideas loaded from smart celebration templates.'
        )
      }
    } catch {
      setStatusText('Unable to complete request; loaded offline celebration ideas.')
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

  // Add idea to timeline task
  const handleAddToPlan = (ideaTitle: string, ideaCategory: string): void => {
    if (!activePlan) return

    // Sensible due date: 30 days before event or today if event is soon
    const eventTime = new Date(activePlan.profile.dateISO).getTime()
    const thirtyDaysBefore = new Date(eventTime - 30 * 24 * 60 * 60 * 1000)
    const dueDate = thirtyDaysBefore > new Date() ? thirtyDaysBefore : new Date()
    const dueISO = dueDate.toISOString().split('T')[0]

    const newTask: Task = {
      id: generateId('task'),
      title: ideaTitle,
      category: ideaCategory.toLowerCase(),
      dueISO,
      phase: 'Mid-Planning & Vendor Finalization',
      critical: false,
      done: false,
      source: 'ai',
      notes: 'Added from Festora Creative Inspiration Ideas.',
    }

    addTask(newTask)
    setToastMessage(`"${ideaTitle}" added to your celebration timeline!`)
  }

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading celebration ideas...
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ARIA Live status region */}
      <div className="sr-only" aria-live="polite">
        {statusText}
      </div>

      {/* Header Bar with SourceBadge and Controls */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
                Creative Inspiration & Design Concepts
              </h2>
              <SourceBadge source={source} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Personalized themes, cultural flourishes, and guest hospitality ideas tailored for {activePlan.profile.city}.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                onClick={() => void fetchIdeas()}
                className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
                aria-label={cooldown > 0 ? `Regenerate available in ${cooldown}s` : 'Regenerate creative ideas'}
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${cooldown > 0 ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{cooldown > 0 ? `Cooldown (${cooldown}s)` : 'Regenerate'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Refinement input: "Anything special?" (Max 300 chars) */}
        <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
          <label htmlFor="ideas-special-notes" className="block text-xs font-semibold text-[var(--text-primary)]">
            Anything special in mind? Refine with your preferences:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="grow relative">
              <Input
                id="ideas-special-notes"
                value={notes}
                maxLength={300}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Include vintage vinyl records, outdoor lawn decor, and filter coffee bar"
              />
              <span className="absolute right-2.5 bottom-2.5 text-[10px] text-[var(--text-muted)]">
                {notes.length}/300
              </span>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loading || cooldown > 0}
              onClick={() => void fetchIdeas(notes)}
              className="rounded-xl text-xs font-semibold shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Refine Ideas</span>
            </Button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--text-muted)]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <span>Avoid sensitive personal data. Free-tier AI may be reviewed by Google.</span>
          </div>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-6 py-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <span className="text-xs text-[var(--text-muted)] animate-pulse block text-center">
            Festora is designing creative concepts and cost-saving tips...
          </span>
        </div>
      ) : bundleData ? (
        <div className="space-y-8">
          {/* Concept Statement Hero Card */}
          {bundleData.concept && (
            <Card variant="surface" className="p-6 sm:p-8 bg-gradient-to-r from-purple-500/5 via-[var(--bg-surface)] to-amber-500/5 border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Celebration Concept</span>
              </div>
              <p className="text-base sm:text-lg font-medium font-display text-[var(--text-primary)] leading-relaxed italic">
                &ldquo;{bundleData.concept}&rdquo;
              </p>
            </Card>
          )}

          {/* 3 Theme Cards */}
          {bundleData.themes && bundleData.themes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Curated Design Themes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bundleData.themes.map((theme, idx) => (
                  <Card key={idx} variant="surface" className="p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-[var(--color-primary)] mb-1 block">
                        Theme 0{idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                        {theme}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 8 Idea Cards Grid with 'Add to plan' buttons */}
          {bundleData.ideas && bundleData.ideas.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Actionable Celebration Ideas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundleData.ideas.map((idea, idx) => (
                  <Card key={idx} variant="surface" className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge
                          variant={idea.estimatedCostBand === 'low' ? 'success' : idea.estimatedCostBand === 'mid' ? 'warning' : 'accent'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {idea.estimatedCostBand} cost
                        </Badge>
                        <span className="text-[11px] text-[var(--text-muted)] capitalize">
                          {idea.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold font-display text-[var(--text-primary)] mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                        {idea.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToPlan(idea.title, idea.category)}
                        className="rounded-xl text-xs font-semibold"
                        aria-label={`Add idea to plan: ${idea.title}`}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" aria-hidden="true" />
                        <span>Add to plan</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Practical Saving Tips */}
          {bundleData.savingTips && bundleData.savingTips.length > 0 && (
            <Card variant="surface" className="p-6 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h3 className="text-base font-bold font-display">
                  Budget Optimization & Practical Saving Tips
                </h3>
              </div>
              <ul className="space-y-2 pl-4 list-disc text-xs sm:text-sm text-[var(--text-secondary)]">
                {bundleData.savingTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : null}

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
