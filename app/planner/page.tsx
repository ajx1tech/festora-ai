'use client'

import React from 'react'
import Link from 'next/link'
import { CalendarHeart, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { SampleDemo } from '@/components/dashboard/SampleDemo'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'

/**
 * Main Planner view rendering the accessible celebration dashboard with lazy-loaded tabs.
 * If no events exist, provides immediate blueprint creation or one-click sample loading.
 *
 * @returns Planner page view.
 */
export default function PlannerPage(): React.ReactElement {
  const { state } = usePlannerStore()
  const activePlan = useActivePlan()

  if (state.hydrated && state.events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 space-y-8 animate-fade-up">
        <EmptyState
          icon={<CalendarHeart className="w-8 h-8 text-[var(--color-primary)]" />}
          title="No celebration blueprints yet"
          description="Build your first celebration with balanced budget mathematics, backwards-scheduled milestones, and optional Gemini creative inspiration."
          action={
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/planner/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors tap-target"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Create new plan</span>
              </Link>
            </div>
          }
        />

        {/* 1-Click Evaluation Sample Blueprints */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <SampleDemo showHeading />
        </div>
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-[var(--text-muted)] animate-pulse">
        Loading celebration plan...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <DashboardTabs />
    </div>
  )
}
