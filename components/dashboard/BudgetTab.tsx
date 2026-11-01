'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DonutChart } from '@/components/ui/DonutChart'
import { Dialog } from '@/components/ui/Dialog'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import { formatMoney } from '@/lib/utils/format'
import { generateId } from '@/lib/utils/ids'
import type { BudgetCategoryId } from '@/lib/domain/schemas'
import {
  Lock,
  Unlock,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from 'lucide-react'

// Distinct vibrant colors for categories in pure-SVG donut
const CATEGORY_COLORS: Record<string, string> = {
  venue: '#6366f1',
  catering: '#ec4899',
  decor: '#8b5cf6',
  photography: '#06b6d4',
  attire: '#10b981',
  music: '#f59e0b',
  invitations: '#14b8a6',
  transport: '#64748b',
  rituals: '#f43f5e',
  cake: '#d946ef',
  entertainment: '#3b82f6',
  food: '#e11d48',
  av: '#0284c7',
  volunteers: '#059669',
  promotion: '#d97706',
  safety: '#475569',
  contingency: '#94a3b8',
}

/**
 * Interactive Budget Engine tab featuring real-time rebalancing, lockable categories,
 * overspend detection, add-expense logging, and what-if financial scenario exploration.
 *
 * @returns Budget dashboard view.
 */
export function BudgetTab(): React.ReactElement {
  const activePlan = useActivePlan()
  const { updateBudgetLine, lockBudgetLine, addExpense, updateProfile } = usePlannerStore()

  // Inline editing state for budget lines
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [editingAmount, setEditingAmount] = useState<string>('')
  const [announcement, setAnnouncement] = useState<string>('')

  // Add Expense Modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState<BudgetCategoryId>('venue')
  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseError, setExpenseError] = useState<string | null>(null)

  // What-If Scenario state (initialized from activePlan profile)
  const [scenarioGuests, setScenarioGuests] = useState<number>(activePlan?.profile.guests ?? 100)
  const [scenarioBudget, setScenarioBudget] = useState<number>(activePlan?.profile.budgetTotal ?? 500000)

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading budget ledger...
      </div>
    )
  }

  const { profile, budget, expenses } = activePlan

  // Metrics
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalAllocated = budget.reduce((sum, b) => sum + b.allocated, 0)
  const remainingBudget = profile.budgetTotal - totalSpent
  const perGuestCost = Math.round(profile.budgetTotal / Math.max(1, profile.guests))

  // Scenario deltas
  const scenarioPerGuest = Math.round(scenarioBudget / Math.max(1, scenarioGuests))
  const deltaPerGuest = scenarioPerGuest - perGuestCost

  // Donut chart items
  const donutSegments = budget.map((b) => ({
    id: b.id,
    label: b.label,
    value: b.allocated,
    color: CATEGORY_COLORS[b.id] ?? '#6366f1',
  }))

  // Handle saving an edited line amount
  const handleSaveLine = (lineId: string): void => {
    const num = parseInt(editingAmount, 10)
    if (isNaN(num) || num < 0) {
      setEditingLineId(null)
      return
    }

    updateBudgetLine(lineId, { allocated: num })
    setEditingLineId(null)
    setAnnouncement(`Updated allocation for category to ${formatMoney(num, profile.currency)}. Other unlocked lines have been automatically rebalanced.`)
  }

  // Handle adding a new discrete expense
  const handleAddExpenseSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setExpenseError(null)

    if (!expenseLabel.trim()) {
      setExpenseError('Please provide an expense description.')
      return
    }

    const amt = parseInt(expenseAmount, 10)
    if (isNaN(amt) || amt <= 0) {
      setExpenseError('Expense amount must be a positive number.')
      return
    }

    addExpense({
      id: generateId('exp'),
      categoryId: expenseCategory,
      label: expenseLabel.trim(),
      amount: amt,
    })

    setExpenseLabel('')
    setExpenseAmount('')
    setIsAddExpenseOpen(false)
    setAnnouncement(`Logged expense ${expenseLabel} of ${formatMoney(amt, profile.currency)}.`)
  }

  // Apply What-if scenario to actual event plan
  const handleApplyScenario = (): void => {
    updateProfile({
      guests: scenarioGuests,
      budgetTotal: scenarioBudget,
    })
    setAnnouncement(`Applied scenario: budget updated to ${formatMoney(scenarioBudget, profile.currency)} for ${scenarioGuests} guests.`)
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Aria-live announcement for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="surface" className="p-4 sm:p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Total Budget
          </span>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)]">
            {formatMoney(profile.budgetTotal, profile.currency)}
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-1 block">
            {budget.length} category allocations
          </span>
        </Card>

        <Card variant="surface" className="p-4 sm:p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Total Spent
          </span>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)]">
            {formatMoney(totalSpent, profile.currency)}
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-1 block">
            {Math.round((totalSpent / profile.budgetTotal) * 100)}% utilization
          </span>
        </Card>

        <Card variant="surface" className="p-4 sm:p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Remaining Budget
          </span>
          <div className={`text-2xl font-bold font-display ${remainingBudget < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatMoney(remainingBudget, profile.currency)}
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-1 block">
            {remainingBudget < 0 ? 'Exceeding overall limit' : 'Available for allocation'}
          </span>
        </Card>

        <Card variant="surface" className="p-4 sm:p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Cost Per Guest
          </span>
          <div className="text-2xl font-bold font-display text-[var(--text-primary)]">
            {formatMoney(perGuestCost, profile.currency)}
          </div>
          <span className="text-xs text-[var(--text-muted)] mt-1 block">
            Calculated across {profile.guests} guests
          </span>
        </Card>
      </div>

      {/* Donut Chart & Contingency Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart Visualizer */}
        <Card variant="surface" className="p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 text-center">
            Budget Distribution
          </h3>
          <DonutChart
            segments={donutSegments}
            size={220}
            strokeWidth={32}
            centerLabel="Allocated"
            centerValue={formatMoney(totalAllocated, profile.currency)}
          />
        </Card>

        {/* Contingency Buffer Explanation Card */}
        <Card variant="surface" className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
              <Info className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                Dynamic Rebalancing & Contingency Safety
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Festora AI keeps your celebration budget strictly balanced. When you edit any category allocation, unlocked categories automatically absorb the delta proportional to their baseline weights. Locked categories remain permanently fixed.
            </p>
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold block mb-0.5">Contingency Buffer Guideline:</span>
              <span>We recommend maintaining at least 5% to 10% in the contingency reserve for last-minute venue taxes, guest count surges, and gratuities.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)]">
              {expenses.length} discrete expense receipts logged
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAddExpenseOpen(true)}
              className="rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Record Expense</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Categories Ledger Table */}
      <Card variant="surface" className="overflow-hidden">
        <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-[var(--text-primary)]">
              Category Allocations & Spent Ledger
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Click any allocation amount to edit. Click the lock icon to freeze a line during auto-rebalancing.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-bold">
                <th scope="col" className="p-3.5 pl-6">Category</th>
                <th scope="col" className="p-3.5">Allocated</th>
                <th scope="col" className="p-3.5">Spent</th>
                <th scope="col" className="p-3.5">Remaining</th>
                <th scope="col" className="p-3.5 min-w-[140px]">Utilization</th>
                <th scope="col" className="p-3.5 pr-6 text-center">Lock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {budget.map((line) => {
                const lineRemaining = line.allocated - line.spent
                const isOverspent = lineRemaining < 0
                const percentSpent = line.allocated > 0 ? Math.min(100, Math.round((line.spent / line.allocated) * 100)) : 0
                const isEditing = editingLineId === line.id

                return (
                  <tr key={line.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    {/* Category Label with Color Dot */}
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[line.id] ?? '#6366f1' }}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-[var(--text-primary)]">
                          {line.label}
                        </span>
                      </div>
                    </td>

                    {/* Allocated (Editable) */}
                    <td className="p-3.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingAmount}
                            onChange={(e) => setEditingAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLine(line.id)
                              if (e.key === 'Escape') setEditingLineId(null)
                            }}
                            autoFocus
                            aria-label={`Edit allocation for ${line.label}`}
                            className="w-28 px-2 py-1 text-xs rounded-lg border border-[var(--color-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            className="px-2 py-1 text-[11px] h-auto"
                            onClick={() => handleSaveLine(line.id)}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLineId(line.id)
                            setEditingAmount(line.allocated.toString())
                          }}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] hover:underline transition-colors"
                          title="Click to edit and rebalance"
                          aria-label={`Allocated ${formatMoney(line.allocated, profile.currency)}. Click to edit.`}
                        >
                          {formatMoney(line.allocated, profile.currency)}
                        </button>
                      )}
                    </td>

                    {/* Spent */}
                    <td className="p-3.5 font-medium text-[var(--text-primary)]">
                      {formatMoney(line.spent, profile.currency)}
                    </td>

                    {/* Remaining / Overspent */}
                    <td className="p-3.5">
                      {isOverspent ? (
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Over by {formatMoney(Math.abs(lineRemaining), profile.currency)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatMoney(lineRemaining, profile.currency)}
                        </span>
                      )}
                    </td>

                    {/* Utilization Progress Bar */}
                    <td className="p-3.5">
                      <ProgressBar
                        value={percentSpent}
                        height={6}
                        label={`${line.label} spend progress`}
                      />
                      <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                        {percentSpent}% spent
                      </span>
                    </td>

                    {/* Lock Toggle Button */}
                    <td className="p-3.5 pr-6 text-center">
                      <button
                        type="button"
                        onClick={() => lockBudgetLine(line.id, !line.locked)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          line.locked
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                        }`}
                        title={line.locked ? 'Line locked: will not adjust on rebalance' : 'Line unlocked: will adjust on rebalance'}
                        aria-label={line.locked ? `Unlock ${line.label}` : `Lock ${line.label}`}
                      >
                        {line.locked ? (
                          <Lock className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Unlock className="w-4 h-4 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* What-If Financial Scenario Explorer */}
      <Card variant="surface" className="p-6">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <SlidersHorizontal className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
          <div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
              What-If Scenario Simulator
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Adjust guest count or overall budget to see immediate live impacts on per-guest economics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Guest Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="scenario-guests" className="text-[var(--text-primary)]">
                Simulated Guest Count
              </label>
              <span className="text-[var(--color-primary)] font-bold">{scenarioGuests} guests</span>
            </div>
            <Slider
              id="scenario-guests"
              min={10}
              max={1500}
              step={5}
              value={[scenarioGuests]}
              onValueChange={(val: number[]) => setScenarioGuests(val[0] ?? 10)}
              ariaLabel="Simulated guests"
            />
          </div>

          {/* Budget Total Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="scenario-budget" className="text-[var(--text-primary)]">
                Simulated Total Budget
              </label>
              <span className="text-[var(--color-primary)] font-bold">
                {formatMoney(scenarioBudget, profile.currency)}
              </span>
            </div>
            <Slider
              id="scenario-budget"
              min={10000}
              max={10000000}
              step={25000}
              value={[scenarioBudget]}
              onValueChange={(val: number[]) => setScenarioBudget(val[0] ?? 500000)}
              ariaLabel="Simulated budget"
            />
          </div>
        </div>

        {/* Live Delta Summary Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">
              Simulated Cost Per Guest
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-display text-[var(--text-primary)]">
                {formatMoney(scenarioPerGuest, profile.currency)}
              </span>
              <span className={`text-xs font-semibold ${deltaPerGuest > 0 ? 'text-rose-600 dark:text-rose-400' : deltaPerGuest < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                {deltaPerGuest > 0 ? `+${formatMoney(deltaPerGuest, profile.currency)}` : deltaPerGuest < 0 ? `${formatMoney(deltaPerGuest, profile.currency)}` : 'No change'} vs current
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyScenario}
            className="rounded-xl border-[var(--border-subtle)] font-semibold text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Apply scenario to plan</span>
          </Button>
        </div>
      </Card>

      {/* Record Expense Modal */}
      {isAddExpenseOpen && (
        <Dialog
          open={isAddExpenseOpen}
          onOpenChange={setIsAddExpenseOpen}
          title="Record Celebration Expense"
          description="Log actual spending against a specific budget category to update real-time spend analytics."
        >
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 pt-2">
            {expenseError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {expenseError}
              </div>
            )}

            <div>
              <label htmlFor="expense-category" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Category
              </label>
              <Select
                id="expense-category"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as BudgetCategoryId)}
                options={budget.map((b) => ({ value: b.id, label: b.label }))}
              />
            </div>

            <div>
              <label htmlFor="expense-label" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Description / Vendor Name
              </label>
              <Input
                id="expense-label"
                value={expenseLabel}
                onChange={(e) => setExpenseLabel(e.target.value)}
                placeholder="e.g. Venue advance deposit"
                required
              />
            </div>

            <div>
              <label htmlFor="expense-amount" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Amount ({profile.currency})
              </label>
              <Input
                id="expense-amount"
                type="number"
                min="1"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="e.g. 50000"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddExpenseOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Expense
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}
