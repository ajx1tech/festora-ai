'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useActivePlan, useReadiness } from '@/lib/store/plannerStore'
import { formatDate, formatMoney } from '@/lib/utils/format'
import { ArrowLeft, Printer } from 'lucide-react'

/**
 * Printable linear blueprint route formatted strictly for physical print or PDF export.
 * Includes page-break rules, black-on-white typography, and zero interactive UI distractions.
 *
 * @returns Clean printable plan document.
 */
export default function PrintPlanPage(): React.ReactElement {
  const activePlan = useActivePlan()
  const readiness = useReadiness()

  if (!activePlan) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-stone-600">
        <p className="mb-4">No active celebration blueprint found.</p>
        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Planner</span>
        </Link>
      </div>
    )
  }

  const { profile, budget, tasks, vendors, aiBundle, runOfShow } = activePlan

  const totalSpent = activePlan.expenses.reduce((sum, e) => sum + e.amount, 0)
  const remainingBudget = profile.budgetTotal - totalSpent

  return (
    <div className="min-h-screen bg-white text-black font-sans p-6 sm:p-12 max-w-4xl mx-auto space-y-8">
      {/* Print Controls Header - Hidden during actual print */}
      <div className="print:hidden flex items-center justify-between pb-6 border-b border-stone-200">
        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Planner</span>
        </Link>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => window.print()}
          className="rounded-xl text-xs font-semibold"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          <span>Print / Save as PDF</span>
        </Button>
      </div>

      {/* Document Title & Metadata */}
      <header className="border-b-2 border-black pb-6 space-y-2">
        <div className="text-xs uppercase tracking-widest font-bold text-stone-500">
          Festora AI Celebration Blueprint
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">
          {profile.name}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <span className="block text-stone-500 font-semibold uppercase">Date</span>
            <span className="font-bold">{formatDate(profile.dateISO)}</span>
          </div>
          <div>
            <span className="block text-stone-500 font-semibold uppercase">City</span>
            <span className="font-bold">{profile.city}</span>
          </div>
          <div>
            <span className="block text-stone-500 font-semibold uppercase">Guests</span>
            <span className="font-bold">{profile.guests} Guests</span>
          </div>
          <div>
            <span className="block text-stone-500 font-semibold uppercase">Total Budget</span>
            <span className="font-bold">{formatMoney(profile.budgetTotal, profile.currency)}</span>
          </div>
        </div>

        {readiness && (
          <div className="mt-4 p-3 bg-stone-100 rounded text-xs flex items-center justify-between">
            <span>Overall Readiness Assessment: <strong>{readiness.label} ({readiness.score}%)</strong></span>
            <span>{tasks.filter((t) => t.done).length} of {tasks.length} tasks completed</span>
          </div>
        )}
      </header>

      {/* 1. Budget Breakdown Table */}
      <section className="space-y-3 break-inside-avoid">
        <h2 className="text-lg font-bold font-serif border-b border-black pb-1 uppercase tracking-wider">
          1. Budget Allocations & Ledger
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 font-bold uppercase text-stone-600">
              <th className="py-2">Category</th>
              <th className="py-2">Allocated</th>
              <th className="py-2">Spent</th>
              <th className="py-2 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {budget.map((line) => (
              <tr key={line.id}>
                <td className="py-1.5 font-medium">{line.label}</td>
                <td className="py-1.5">{formatMoney(line.allocated, profile.currency)}</td>
                <td className="py-1.5">{formatMoney(line.spent, profile.currency)}</td>
                <td className="py-1.5 text-right font-medium">
                  {formatMoney(line.allocated - line.spent, profile.currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td className="py-2">Total Committed / Spent</td>
              <td className="py-2">{formatMoney(profile.budgetTotal, profile.currency)}</td>
              <td className="py-2">{formatMoney(totalSpent, profile.currency)}</td>
              <td className="py-2 text-right">{formatMoney(remainingBudget, profile.currency)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* 2. Timeline Milestones */}
      <section className="space-y-3 break-inside-avoid">
        <h2 className="text-lg font-bold font-serif border-b border-black pb-1 uppercase tracking-wider">
          2. Scheduled Milestones
        </h2>
        <div className="space-y-4">
          {Array.from(new Set(tasks.map((t) => t.phase))).map((phase) => {
            const phaseTasks = tasks.filter((t) => t.phase === phase)
            return (
              <div key={phase} className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  {phase}
                </h3>
                <ul className="text-xs space-y-1 pl-4 list-disc">
                  {phaseTasks.map((t) => (
                    <li key={t.id} className="leading-snug">
                      <span className={t.done ? 'line-through text-stone-400' : 'font-medium'}>
                        {t.title}
                      </span>
                      <span className="text-stone-500 ml-2">
                        [Due: {formatDate(t.dueISO)}{t.critical ? ' - CRITICAL' : ''}]
                      </span>
                      {t.notes && <p className="text-stone-600 italic ml-2">&ldquo;{t.notes}&rdquo;</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Vendor Contracts & Checklist */}
      <section className="space-y-3 break-inside-avoid">
        <h2 className="text-lg font-bold font-serif border-b border-black pb-1 uppercase tracking-wider">
          3. Vendor Contracts & Vetting
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 font-bold uppercase text-stone-600">
              <th className="py-2">Category</th>
              <th className="py-2">Vendor Name</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {vendors.map((v) => (
              <tr key={v.id}>
                <td className="py-1.5 font-medium capitalize">{v.category}</td>
                <td className="py-1.5">{v.name || 'Unassigned'}</td>
                <td className="py-1.5 capitalize">{v.status}</td>
                <td className="py-1.5 text-right font-medium">
                  {v.quote > 0 ? formatMoney(v.quote, profile.currency) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 4. Creative Inspiration & Themes */}
      {aiBundle && (
        <section className="space-y-3 break-inside-avoid">
          <h2 className="text-lg font-bold font-serif border-b border-black pb-1 uppercase tracking-wider">
            4. Creative Concept & Themes
          </h2>
          {aiBundle.concept && (
            <p className="text-xs italic text-stone-800 leading-relaxed">
              &ldquo;{aiBundle.concept}&rdquo;
            </p>
          )}
          {aiBundle.themes && aiBundle.themes.length > 0 && (
            <ul className="text-xs space-y-1 pl-4 list-disc">
              {aiBundle.themes.map((theme, i) => (
                <li key={i} className="leading-snug">
                  {theme}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 5. Day-of Run of Show */}
      {runOfShow && runOfShow.length > 0 && (
        <section className="space-y-3 break-inside-avoid">
          <h2 className="text-lg font-bold font-serif border-b border-black pb-1 uppercase tracking-wider">
            5. Event Day Run of Show
          </h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-300 font-bold uppercase text-stone-600">
                <th className="py-2 w-28">Time</th>
                <th className="py-2 w-48">Milestone</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {runOfShow.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-bold">{item.time}</td>
                  <td className="py-1.5 font-medium">{item.title}</td>
                  <td className="py-1.5 text-stone-700">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="pt-6 border-t border-stone-300 text-center text-[10px] text-stone-400">
        Generated by Festora AI &bull; {new Date().toLocaleDateString()}
      </footer>
    </div>
  )
}
