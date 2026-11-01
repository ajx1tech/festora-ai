import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { EventProfile } from '@/lib/domain/schemas'
import { formatDate, formatMoney } from '@/lib/utils/format'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import React from 'react'

export interface Step4ReviewProps {
  profile: EventProfile
  errors?: Record<string, string>
  onSubmit: () => void
  submitting?: boolean
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

/**
 * Step 4 of the creation wizard: Final Review & Plan Assembly.
 *
 * @param props - Step4Review properties.
 * @returns Review summary and creation action.
 */
export function Step4Review({
  profile,
  errors = {},
  onSubmit,
  submitting = false,
  headingRef,
}: Step4ReviewProps): React.ReactElement {
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)] focus-visible:outline-none"
        >
          Review your celebration blueprint
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Verify your details. Once submitted, our engines will construct a
          complete budget breakdown, backwards-scheduled milestones, and vendor
          checklist.
        </p>
      </div>

      {/* Error Summary Banner (If Any Step Failed) */}
      {hasErrors && (
        <div
          role="alert"
          aria-label="Form validation error summary"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-sm space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Please resolve the following issues before creating your plan:
            </span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 pl-1">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>
                <strong>{field}:</strong> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Event Overview Card */}
        <Card variant="surface" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Celebration Profile
            </span>
            <Badge variant="accent" className="capitalize">
              {profile.type}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
              {profile.name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar
                  className="w-3.5 h-3.5 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                {formatDate(profile.dateISO)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin
                  className="w-3.5 h-3.5 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                {profile.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2
                  className="w-3.5 h-3.5 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                <span className="capitalize">{profile.venueType}</span> venue
              </span>
            </div>
          </div>
        </Card>

        {/* Budget & Scale Card */}
        <Card variant="surface" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Financial Scale
            </span>
            <Badge variant="subtle">{profile.currency}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[var(--text-muted)] block">
                Total Budget
              </span>
              <span className="text-2xl font-bold font-display text-[var(--text-primary)] mt-0.5 block">
                {formatMoney(profile.budgetTotal, profile.currency)}
              </span>
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] block">
                Expected Guests
              </span>
              <span className="text-2xl font-bold font-display text-[var(--text-primary)] mt-0.5 block flex items-center gap-1.5">
                <Users
                  className="w-5 h-5 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                {profile.guests}
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
            Estimated per-guest:{' '}
            <strong>
              {formatMoney(
                Math.round(profile.budgetTotal / profile.guests),
                profile.currency
              )}
            </strong>
          </div>
        </Card>
      </div>

      {/* Style & Traditions Card */}
      <Card variant="surface" className="p-6 space-y-5">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] block pb-2 border-b border-[var(--border-subtle)]">
          Ambiance & Cultural Customs
        </span>

        {profile.vibes.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
              Selected Vibes
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.vibes.map((vibe) => (
                <span
                  key={vibe}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium"
                >
                  {vibe}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.dietary.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
              Dietary Hospitality
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.dietary.map((d) => (
                <span
                  key={d}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.traditions && (
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Rituals & Notes
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic bg-[var(--bg-surface-elevated)] p-3 rounded-xl border border-[var(--border-subtle)]">
              &ldquo;{profile.traditions}&rdquo;
            </p>
          </div>
        )}
      </Card>

      {/* Final Submission Button */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
          <CheckCircle
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>
            All data will be saved securely to your local browser storage.
          </span>
        </div>

        <Button
          type="button"
          size="lg"
          loading={submitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8"
        >
          <Sparkles className="w-5 h-5 mr-1" aria-hidden="true" />
          <span>Create my celebration plan</span>
        </Button>
      </div>
    </div>
  )
}
