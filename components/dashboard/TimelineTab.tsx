'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Dialog } from '@/components/ui/Dialog'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import { daysUntil } from '@/lib/engines/timelineEngine'
import { formatDate } from '@/lib/utils/format'
import { generateId } from '@/lib/utils/ids'
import { buildICS } from '@/lib/engines/icsExport'
import type { Task } from '@/lib/domain/schemas'
import {
  Calendar,
  AlertCircle,
  Clock,
  Plus,
  Download,
  Filter,
  FileText,
} from 'lucide-react'

type FilterType = 'all' | 'critical' | 'overdue' | 'done'

/**
 * Backwards-scheduled timeline management panel supporting phase grouping,
 * deadline filters, overdue tracking, inline notes editing, and custom task creation.
 *
 * @returns Timeline tab view.
 */
export function TimelineTab(): React.ReactElement {
  const activePlan = useActivePlan()
  const { toggleTask, addTask, updateTask } = usePlannerStore()

  // Filter state
  const [filter, setFilter] = useState<FilterType>('all')

  // Inline note editing state
  const [editingNoteTaskId, setEditingNoteTaskId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState<string>('')

  // Add Custom Task Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('planning')
  const [newDueISO, setNewDueISO] = useState('')
  const [newPhase, setNewPhase] = useState('Mid-Planning & Vendor Finalization')
  const [newCritical, setNewCritical] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading celebration timeline...
      </div>
    )
  }

  const { tasks, profile } = activePlan
  const now = new Date()

  // Progress metrics
  const completedCount = tasks.filter((t) => t.done).length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  // Filtered task set
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'critical') return task.critical && !task.done
    if (filter === 'done') return task.done
    if (filter === 'overdue') {
      const days = daysUntil(task.dueISO, now)
      return !task.done && days < 0
    }
    return true
  })

  // Group by Phase
  const phases = Array.from(new Set(tasks.map((t) => t.phase)))
  // If no predefined phases, provide default order
  const displayPhases = phases.length > 0 ? phases : [
    'Early Vision & Core Bookings',
    'Mid-Planning & Vendor Finalization',
    'Final Month & Logistics',
    'Final Week',
    'Event Day',
  ]

  // Add Task submit handler
  const handleAddTaskSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setFormError(null)

    if (!newTitle.trim()) {
      setFormError('Please enter a milestone title.')
      return
    }

    if (!newDueISO) {
      setFormError('Please select a valid deadline date.')
      return
    }

    const newTask: Task = {
      id: generateId('task'),
      title: newTitle.trim(),
      category: newCategory.trim().toLowerCase(),
      dueISO: newDueISO,
      phase: newPhase,
      critical: newCritical,
      done: false,
      source: 'user',
      notes: '',
    }

    addTask(newTask)
    setNewTitle('')
    setNewDueISO('')
    setNewCritical(false)
    setIsAddOpen(false)
  }

  // Save inline task notes
  const handleSaveNotes = (taskId: string): void => {
    updateTask(taskId, { notes: noteContent.trim() })
    setEditingNoteTaskId(null)
  }

  // Export .ics calendar
  const handleExportIcs = (): void => {
    try {
      const icsString = buildICS(activePlan)
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}-schedule.ics`
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
      {/* Top Header & Progress Ribbon */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
              Backwards-Scheduled Milestones
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Deadlines calculated backwards from celebration day on {formatDate(profile.dateISO)}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportIcs}
              className="rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Add to Calendar</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Add Custom Milestone</span>
            </Button>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {completedCount} of {tasks.length} Milestones Completed ({progressPercent}%)
            </span>
            <span>
              {tasks.filter((t) => t.critical && !t.done).length} Critical Remaining
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            height={8}
            label="Overall celebration timeline completion"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" aria-hidden="true" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-rose-600'
            }`}
          >
            Critical ({tasks.filter((t) => t.critical && !t.done).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === 'overdue'
                ? 'bg-amber-600 text-white'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-amber-600'
            }`}
          >
            Overdue ({tasks.filter((t) => !t.done && daysUntil(t.dueISO, now) < 0).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('done')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === 'done'
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-emerald-600'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </Card>

      {/* Tasks Grouped by Phase */}
      <div className="space-y-6">
        {displayPhases.map((phase) => {
          const phaseTasks = filteredTasks.filter((t) => t.phase === phase)
          if (phaseTasks.length === 0) return null

          return (
            <Card key={phase} variant="surface" className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold font-display text-[var(--text-primary)] uppercase tracking-wider">
                  {phase}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  {phaseTasks.filter((t) => t.done).length} / {phaseTasks.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {phaseTasks.map((task) => {
                  const days = daysUntil(task.dueISO, now)
                  const isOverdue = !task.done && days < 0
                  const isEditingNote = editingNoteTaskId === task.id

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        task.done
                          ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-75'
                          : isOverdue
                          ? 'bg-amber-500/5 border-amber-500/25'
                          : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`task-check-${task.id}`}
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Toggle task completion: ${task.title}`}
                          className="mt-1 w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
                        />

                        <div className="grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <label
                              htmlFor={`task-check-${task.id}`}
                              className={`text-xs sm:text-sm font-medium cursor-pointer ${
                                task.done
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {task.title}
                            </label>

                            {task.critical && (
                              <Badge
                                variant="warning"
                                className="text-[10px] py-0 px-1.5 flex items-center gap-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                              >
                                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                <span>Critical</span>
                              </Badge>
                            )}

                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                <Clock className="w-3 h-3" aria-hidden="true" />
                                <span>{Math.abs(days)}d Overdue</span>
                              </span>
                            )}

                            {task.source === 'ai' && (
                              <Badge variant="accent" className="text-[10px] py-0 px-1.5">
                                AI Generated
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              <span>Due: {formatDate(task.dueISO)}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="capitalize">{task.category}</span>
                          </div>

                          {/* Inline Notes Display & Edit */}
                          {isEditingNote ? (
                            <div className="mt-2.5 space-y-2">
                              <Input
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Add custom notes, vendor phone numbers, or checklist details..."
                                autoFocus
                                aria-label={`Notes for ${task.title}`}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="primary"
                                  className="h-auto py-1 px-2.5 text-xs"
                                  onClick={() => handleSaveNotes(task.id)}
                                >
                                  Save Note
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-auto py-1 px-2.5 text-xs"
                                  onClick={() => setEditingNoteTaskId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              {task.notes ? (
                                <p className="text-[var(--text-secondary)] italic">
                                  &ldquo;{task.notes}&rdquo;
                                </p>
                              ) : (
                                <span className="text-[var(--text-muted)] text-[10px]">No notes attached</span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteTaskId(task.id)
                                  setNoteContent(task.notes || '')
                                }}
                                className="text-[var(--color-primary)] hover:underline ml-2 flex items-center gap-1 text-[11px] font-medium shrink-0"
                              >
                                <FileText className="w-3 h-3" aria-hidden="true" />
                                <span>{task.notes ? 'Edit note' : '+ Add note'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
            No milestones match the selected filter.
          </div>
        )}
      </div>

      {/* Add Custom Milestone Dialog */}
      {isAddOpen && (
        <Dialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          title="Add Custom Milestone"
          description="Create a custom milestone backwards-scheduled into your celebration timeline."
        >
          <form onSubmit={handleAddTaskSubmit} className="space-y-4 pt-2">
            {formError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="task-title" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Milestone Title
              </label>
              <Input
                id="task-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Schedule rehearsal dinner"
                required
              />
            </div>

            <div>
              <label htmlFor="task-category" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Category
              </label>
              <Input
                id="task-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. venue, catering, decor"
                required
              />
            </div>

            <div>
              <label htmlFor="task-phase" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Phase
              </label>
              <Select
                id="task-phase"
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                options={displayPhases.map((p) => ({ value: p, label: p }))}
              />
            </div>

            <div>
              <label htmlFor="task-due" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Due Date
              </label>
              <Input
                id="task-due"
                type="date"
                value={newDueISO}
                onChange={(e) => setNewDueISO(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="task-critical"
                checked={newCritical}
                onChange={(e) => setNewCritical(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="task-critical" className="text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                Mark as Critical Priority Milestone
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Milestone
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}
