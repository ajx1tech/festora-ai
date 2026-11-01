'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { SampleDemo } from '@/components/dashboard/SampleDemo'
import { usePlannerStore } from '@/lib/store/plannerStore'
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Editorial Hero section highlighting product mission, dual CTAs, and interactive plan preview.
 *
 * @returns Hero section element.
 */
export function Hero(): React.ReactElement {
  const router = useRouter()
  const { loadSample } = usePlannerStore()

  const handleTrySampleWedding = (): void => {
    loadSample('wedding')
    router.push('/planner')
  }

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden mesh-gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Editorial Copy */}
          <div className="lg:col-span-7 flex flex-col items-start animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--color-primary)] mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Deterministic Planning &bull; Grounded GenAI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-[1.12] mb-6 max-w-2xl">
              Plan every celebration,{' '}
              <span className="italic font-normal text-[var(--color-primary)]">
                beautifully.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl">
              From intimate birthday dinners to grand multi-day weddings.
              Zero-drift budgets, backwards-scheduled timelines, vendor
              checklists, and creative AI inspiration—grounded in your culture
              and stored safely in your browser.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/planner/new"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-md transition-all tap-target focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
              >
                <span>Plan my celebration</span>
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={handleTrySampleWedding}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] shadow-sm transition-all tap-target focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] cursor-pointer"
              >
                <HeartHandshake
                  className="w-5 h-5 text-[var(--color-primary)] shrink-0"
                  aria-hidden="true"
                />
                <span>Try a sample wedding</span>
              </button>
            </div>

            {/* Quick Proof Points */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                No account required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                100% Client-side privacy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                Offline resilient
              </span>
            </div>

            {/* 1-Click Sample Celebration Evaluator */}
            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <SampleDemo />
            </div>
          </div>

          {/* Interactive Hero Preview Card */}
          <div className="lg:col-span-5 relative animate-fade-up">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary)]">
                    Live Blueprint Preview
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] mt-1">
                    Ananya & Rohan&apos;s Wedding
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Pune &bull; 250 Guests &bull; 180 Days to go
                  </p>
                </div>
                <ProgressRing
                  value={84}
                  size={64}
                  label="Readiness score 84%"
                />
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] block">
                    Planned Budget
                  </span>
                  <span className="text-lg font-bold font-display text-[var(--text-primary)] mt-0.5 block">
                    ₹25,00,000
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    10 Categories Balanced
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] block">
                    Readiness Score
                  </span>
                  <span className="text-lg font-bold font-display text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    84 / 100
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Ahead of schedule
                  </span>
                </div>
              </div>

              {/* Upcoming Critical Task Item */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] mb-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                  <span className="font-semibold text-[var(--text-secondary)]">
                    Next Critical Milestone
                  </span>
                  <span className="text-[var(--color-accent)] font-medium">
                    Due in 60 days
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Confirm floral mandap designer & ceremonial sound setup
                </p>
              </div>

              {/* AI Creative Enrichment Teaser */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <SourceBadge source="gemini" model="gemini-3.8-flash" />
                  <span className="text-xs text-[var(--text-muted)]">
                    Concept & ideas ready
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--color-primary)]">
                  3 Themes &bull; 8 Ideas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
