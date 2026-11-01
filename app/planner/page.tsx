'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SourceBadge } from '@/components/ui/SourceBadge'
import {
  useActivePlan,
  usePlannerStore,
  useReadiness,
} from '@/lib/store/plannerStore'
import { formatDate, formatMoney } from '@/lib/utils/format'
import {
  Calendar,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Coins,
  HeartHandshake,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

/**
 * Main Planner overview page showcasing the active celebration blueprint.
 * If no events exist, offers immediate plan creation or one-click sample loading.
 *
 * @returns Planner page view.
 */
export default function PlannerPage(): React.ReactElement {
  const { state, loadSample, toggleTask } = usePlannerStore()
  const activePlan = useActivePlan()
  const readiness = useReadiness()

  if (state.hydrated && state.events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <EmptyState
          icon={<CalendarHeart className="w-6 h-6" />}
          title="No celebration plans yet"
          description="Build your first celebration blueprint with deterministic budget mathematics, backwards-scheduled milestones, and optional Gemini creative inspiration."
          action={
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/planner/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-colors tap-target"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Create new plan</span>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  loadSample('wedding')
                }}
              >
                <HeartHandshake
                  className="w-4 h-4 mr-1 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                <span>Try a sample wedding</span>
              </Button>
            </div>
          }
        />
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

  const { profile, budget, tasks, expenses, aiBundle } = activePlan

  // Basic metrics
  const completedTasks = tasks.filter((t) => t.done).length
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const budgetUtilization = Math.round((totalSpent / profile.budgetTotal) * 100)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-up">
      {/* Event Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="accent" className="capitalize">
              {profile.type}
            </Badge>
            <span className="text-xs text-[var(--text-muted)]">
              Created {formatDate(activePlan.createdAtISO)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)]">
            {profile.name}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--text-secondary)] mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar
                className="w-4 h-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              {formatDate(profile.dateISO)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin
                className="w-4 h-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              {profile.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Users
                className="w-4 h-4 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              {profile.guests} guests
            </span>
          </div>
        </div>

        {/* Readiness Badge / Score */}
        {readiness && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <ProgressRing
              value={readiness.score}
              size={64}
              label={`Readiness ${readiness.score}%`}
            />
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Readiness Score
              </span>
              <span className="text-xl font-bold font-display text-[var(--text-primary)] block">
                {readiness.label}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {readiness.alerts.length} action items
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Core Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Metric */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Budget Allocated
            </span>
            <Coins
              className="w-5 h-5 text-[var(--color-primary)]"
              aria-hidden="true"
            />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {formatMoney(profile.budgetTotal, profile.currency)}
          </div>
          <ProgressBar
            value={budgetUtilization}
            label="Spent so far"
            height={6}
            showText
          />
          <span className="text-xs text-[var(--text-muted)] mt-2 block">
            {budget.length} category lines balanced
          </span>
        </Card>

        {/* Tasks Metric */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Timeline Milestones
            </span>
            <Clock
              className="w-5 h-5 text-[var(--color-primary)]"
              aria-hidden="true"
            />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {completedTasks} / {tasks.length} Completed
          </div>
          <ProgressBar
            value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}
            label="Milestone completion"
            height={6}
            showText
          />
          <span className="text-xs text-[var(--text-muted)] mt-2 block">
            Backwards scheduled from celebration day
          </span>
        </Card>

        {/* Vendors Metric */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Vendors & Contracts
            </span>
            <CheckCircle2
              className="w-5 h-5 text-[var(--color-primary)]"
              aria-hidden="true"
            />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {activePlan.vendors.length} Tracked
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
            WhatsApp outreach drafts and contract status tracking available.
          </p>
        </Card>
      </div>

      {/* Immediate Next Tasks Checklist */}
      <Card variant="surface" className="p-6">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-bold font-display text-[var(--text-primary)]">
              Upcoming Planning Milestones
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Click checkboxes to update milestone completion.
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Showing first 5 tasks
          </span>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] transition-colors"
            >
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark task completed: ${task.title}`}
                className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
              />
              <div className="grow">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm font-medium cursor-pointer ${
                    task.done
                      ? 'line-through text-[var(--text-muted)]'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                  <span>Due: {formatDate(task.dueISO)}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{task.category}</span>
                  {task.critical && (
                    <>
                      <span>&bull;</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Critical
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Creative Ideas Teaser (If Present) */}
      {aiBundle && (
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Sparkles
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                aria-hidden="true"
              />
              <h2 className="text-lg font-bold font-display text-[var(--text-primary)]">
                Creative Inspiration Bundle
              </h2>
            </div>
            <SourceBadge source="template" />
          </div>

          <p className="text-sm font-medium text-[var(--text-secondary)] italic mb-4">
            &ldquo;{aiBundle.concept}&rdquo;
          </p>

          {aiBundle.themes && aiBundle.themes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {aiBundle.themes.map((theme, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs font-semibold text-[var(--text-primary)]"
                >
                  {theme}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
