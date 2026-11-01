'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useActivePlan, usePlannerStore, useReadiness } from '@/lib/store/plannerStore'
import { daysUntil } from '@/lib/engines/timelineEngine'
import { committedSpend } from '@/lib/engines/vendorEngine'
import { formatDate, formatMoney } from '@/lib/utils/format'
import { buildICS } from '@/lib/engines/icsExport'
import {
  Clock,
  Coins,
  MapPin,
  Users,
  AlertTriangle,
  AlertCircle,
  Info,
  CalendarCheck2,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export interface OverviewTabProps {
  onTabChange?: (tab: string) => void
}

/**
 * Overview tab featuring live milestone countdown, readiness assessment,
 * engine alerts with direct jump actions, and quick export shortcuts.
 *
 * @param props - Component properties.
 * @returns Overview dashboard panel.
 */
export function OverviewTab({ onTabChange }: OverviewTabProps): React.ReactElement {
  const activePlan = useActivePlan()
  const { toggleTask } = usePlannerStore()
  const readiness = useReadiness()

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading celebration blueprint...
      </div>
    )
  }

  const { profile, tasks, expenses, vendors } = activePlan
  const now = new Date()
  const daysLeft = daysUntil(profile.dateISO, now)
  const isCompressed = daysLeft >= 0 && daysLeft <= 30

  // Metrics
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalCommitted = committedSpend(vendors)
  const totalObligated = Math.max(totalSpent, totalCommitted)
  const remainingBudget = profile.budgetTotal - totalObligated
  const perGuestCost = Math.round(profile.budgetTotal / Math.max(1, profile.guests))
  const budgetUtilization = Math.min(
    100,
    Math.round((totalObligated / profile.budgetTotal) * 100)
  )

  // Next 3 tasks
  const pendingTasks = tasks.filter((t) => !t.done)
  const nextThreeTasks = pendingTasks.slice(0, 3)

  // Calendar export handler
  const handleIcsExport = (): void => {
    try {
      const icsString = buildICS(activePlan)
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.ics`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Handled silently
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Compressed Schedule Warning Banner */}
      {isCompressed && (
        <div
          role="status"
          className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block">Compressed Planning Schedule ({daysLeft} days remaining)</span>
            <span>Festora has automatically compressed vendor lead times and milestones for high-priority bookings.</span>
          </div>
        </div>
      )}

      {/* Hero Card: Countdown & Key Details */}
      <Card variant="surface" className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <Badge variant="accent" className="capitalize">
                {profile.type}
              </Badge>
              <span className="text-xs text-[var(--text-muted)]">
                {formatDate(profile.dateISO)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)]">
              {profile.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                {profile.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                {profile.guests} guests
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                <Coins className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                {formatMoney(profile.budgetTotal, profile.currency)} total
              </span>
            </div>
          </div>

          {/* Countdown & Readiness Badge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs">
            {readiness && (
              <ProgressRing
                value={readiness.score}
                size={70}
                strokeWidth={7}
                label={`Readiness score ${readiness.score}%`}
              />
            )}
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                {daysLeft > 0 ? `${daysLeft} Days to Go` : daysLeft === 0 ? 'Today is the Day!' : 'Celebration Completed'}
              </span>
              <span className="text-xl font-bold font-display text-[var(--text-primary)] block">
                {readiness?.label ?? 'In Progress'}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {readiness?.score ?? 0}% overall readiness
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIcsExport}
            className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Add to Calendar (.ics)</span>
          </Button>

          <Link
            href="/planner/print"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>Print Blueprint</span>
          </Link>

          {onTabChange && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onTabChange('chat')}
              className="text-xs text-[var(--color-primary)] font-semibold ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Ask Festora AI</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Snapshot Cards Grid: Budget & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Snapshot */}
        <Card variant="surface" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Budget Obligated
            </span>
            <Coins className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {formatMoney(totalObligated, profile.currency)}
          </div>
          <ProgressBar
            value={budgetUtilization}
            label="Committed or spent"
            height={6}
            showText
          />
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-3">
            <span>Remaining: <strong className="text-[var(--text-primary)]">{formatMoney(remainingBudget, profile.currency)}</strong></span>
            <span>Per guest: <strong>{formatMoney(perGuestCost, profile.currency)}</strong></span>
          </div>
        </Card>

        {/* Milestone Snapshot */}
        <Card variant="surface" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Timeline Progress
            </span>
            <Clock className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {tasks.filter((t) => t.done).length} / {tasks.length} Completed
          </div>
          <ProgressBar
            value={tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0}
            label="Task milestone completion"
            height={6}
            showText
          />
          <span className="text-xs text-[var(--text-muted)] mt-3 block">
            {tasks.filter((t) => t.critical && !t.done).length} critical milestones remaining
          </span>
        </Card>

        {/* Vendor Snapshot */}
        <Card variant="surface" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Vendors Booked
            </span>
            <CalendarCheck2 className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)] mb-1">
            {vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length} / {vendors.length} Booked
          </div>
          <ProgressBar
            value={vendors.length > 0 ? Math.round((vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length / vendors.length) * 100) : 0}
            label="Vendor contracts booked"
            height={6}
            showText
          />
          <span className="text-xs text-[var(--text-muted)] mt-3 block">
            {formatMoney(totalCommitted, profile.currency)} committed contract value
          </span>
        </Card>
      </div>

      {/* Engine Alerts List & Next 3 Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next 3 Immediate Tasks */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                Next Urgent Milestones
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Check off tasks to dynamically increase your celebration readiness.
              </p>
            </div>
            {onTabChange && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('timeline')}
                className="text-xs font-semibold text-[var(--color-primary)]"
              >
                View all ({pendingTasks.length})
              </Button>
            )}
          </div>

          {nextThreeTasks.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-4 text-center">
              All planned milestones have been completed!
            </div>
          ) : (
            <div className="space-y-3">
              {nextThreeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`overview-task-${task.id}`}
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark milestone completed: ${task.title}`}
                    className="mt-0.5 w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
                  />
                  <div className="grow min-w-0">
                    <label
                      htmlFor={`overview-task-${task.id}`}
                      className="text-xs sm:text-sm font-medium text-[var(--text-primary)] block truncate cursor-pointer"
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
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
          )}
        </Card>

        {/* Engine Alerts with Actionable Jump Buttons */}
        <Card variant="surface" className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                Celebration Health & Alerts
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Algorithmic checks calculated by Festora deterministic engines.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]">
              {readiness?.alerts.length ?? 0} notices
            </span>
          </div>

          {!readiness || readiness.alerts.length === 0 ? (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 py-4 text-center font-medium">
              Everything is on track! No critical budget or scheduling risks detected.
            </div>
          ) : (
            <div className="space-y-3">
              {readiness.alerts.map((alert) => {
                const isCrit = alert.severity === 'critical'
                const isWarn = alert.severity === 'warning'

                // Determine target tab from alert action or message
                let targetTab = 'overview'
                if (alert.title.toLowerCase().includes('budget') || alert.message.toLowerCase().includes('budget')) {
                  targetTab = 'budget'
                } else if (alert.title.toLowerCase().includes('vendor') || alert.message.toLowerCase().includes('vendor')) {
                  targetTab = 'vendors'
                } else if (alert.title.toLowerCase().includes('task') || alert.title.toLowerCase().includes('schedule')) {
                  targetTab = 'timeline'
                }

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs ${
                      isCrit
                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-200'
                        : isWarn
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200'
                        : 'bg-blue-500/10 border-blue-500/25 text-blue-900 dark:text-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isCrit ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                      <div>
                        <span className="font-bold block">{alert.title}</span>
                        <span className="text-[11px] opacity-90 block mt-0.5 leading-relaxed">
                          {alert.message}
                        </span>
                      </div>
                    </div>

                    {onTabChange && (
                      <button
                        type="button"
                        onClick={() => onTabChange(targetTab)}
                        className="inline-flex items-center gap-1 font-semibold text-[11px] underline shrink-0 hover:opacity-80 transition-opacity"
                        aria-label={`Jump to ${targetTab} for alert: ${alert.title}`}
                      >
                        <span>Fix</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
