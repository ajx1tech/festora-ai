'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  useActivePlan,
  usePlannerStore,
  useReadiness,
} from '@/lib/store/plannerStore'
import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export interface PlannerLayoutProps {
  children: React.ReactNode
}

/**
 * Planner shell layout featuring event switcher, readiness mini-ring, theme toggle, and new-event button.
 *
 * @param props - Layout children.
 * @returns Planner application shell.
 */
export default function PlannerLayout({
  children,
}: PlannerLayoutProps): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const { state, setActive } = usePlannerStore()
  const activePlan = useActivePlan()
  const readiness = useReadiness()

  const handleEventSwitch = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const eventId = e.target.value
    if (eventId === '__new__') {
      router.push('/planner/new')
    } else {
      setActive(eventId)
    }
  }

  // Determine active event type for data-event attribute
  const activeEventType = activePlan?.profile.type || 'wedding'

  return (
    <div
      data-event={activeEventType}
      className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
    >
      {/* Planner Shell Header */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group tap-target rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Festora AI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-bold text-[var(--text-primary)] hidden sm:inline">
                Festora<span className="text-[var(--color-primary)]">.ai</span>
              </span>
            </Link>

            {/* Event Switcher Dropdown (When events exist) */}
            {state.events.length > 0 && (
              <div className="relative max-w-xs">
                <select
                  value={activePlan?.id || ''}
                  onChange={handleEventSwitch}
                  aria-label="Switch active event plan"
                  className="px-3 py-1.5 pr-8 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] appearance-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {state.events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.profile.name}
                    </option>
                  ))}
                  <option value="__new__">+ Create another plan...</option>
                </select>
              </div>
            )}
          </div>

          {/* Controls: Readiness Mini-Ring, ThemeToggle, New Event Button */}
          <div className="flex items-center gap-3">
            {/* Readiness Mini-Ring */}
            {activePlan && readiness && (
              <div
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]"
                title={`Overall celebration readiness score: ${readiness.score}/100 (${readiness.label})`}
              >
                <ProgressRing
                  value={readiness.score}
                  size={32}
                  strokeWidth={4}
                  showText={false}
                  label={`Readiness score ${readiness.score}%`}
                />
                <span className="text-xs font-bold text-[var(--text-primary)] hidden md:inline">
                  {readiness.score}% Ready
                </span>
              </div>
            )}

            <ThemeToggle />

            {pathname !== '/planner/new' && (
              <Link
                href="/planner/new"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors tap-target focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">New Event</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Landmark */}
      <main id="main-content" className="grow">
        {children}
      </main>
    </div>
  )
}
