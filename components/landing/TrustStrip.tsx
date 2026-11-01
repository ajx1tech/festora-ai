import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react'
import React from 'react'

/**
 * Trust & Privacy reassurance strip detailing client-side privacy and safe AI usage boundaries.
 *
 * @returns Trust strip section element.
 */
export function TrustStrip(): React.ReactElement {
  return (
    <section className="py-12 bg-[var(--bg-surface-elevated)] border-y border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Lock
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--text-primary)]">
                  Your plans stay in your browser
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                All event profiles, budgets, and milestone records are stored
                exclusively in your browser via local storage. We never store
                your events on external servers or track your planning
                activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-medium shrink-0">
            <AlertTriangle
              className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <span>Don&apos;t enter sensitive personal data in AI prompts.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
