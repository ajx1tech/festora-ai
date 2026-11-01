import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import type { EventType } from '@/lib/domain/schemas'
import { daysUntil } from '@/lib/engines/timelineEngine'
import { AlertCircle, Cake, Calendar, Heart, MapPin, Users } from 'lucide-react'
import React, { useMemo } from 'react'

export interface Step1Data {
  type: EventType
  name: string
  dateISO: string
  city: string
}

export interface Step1BasicsProps {
  data: Step1Data
  errors?: Partial<Record<keyof Step1Data, string>>
  onChange: (updates: Partial<Step1Data>) => void
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

const TYPE_OPTIONS: {
  type: EventType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    type: 'wedding',
    title: 'Wedding',
    subtitle: 'Ceremonies, dinners, multi-day rituals',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
  },
  {
    type: 'birthday',
    title: 'Birthday',
    subtitle: 'Milestones, themes, party entertainment',
    icon: <Cake className="w-5 h-5 text-amber-500" />,
  },
  {
    type: 'community',
    title: 'Community Festival',
    subtitle: 'Utsavs, public melas, cultural stages',
    icon: <Users className="w-5 h-5 text-teal-500" />,
  },
]

/**
 * Step 1 of the creation wizard: Celebration Type, Name, Date, and City.
 *
 * @param props - Step1Basics properties.
 * @returns Accessible form step.
 */
export function Step1Basics({
  data,
  errors = {},
  onChange,
  headingRef,
}: Step1BasicsProps): React.ReactElement {
  // Calculate tomorrow ISO for min date
  const tomorrowISO = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  // Days left calculation
  const daysLeft = useMemo(() => {
    if (!data.dateISO) return null
    return daysUntil(data.dateISO, new Date())
  }, [data.dateISO])

  const isCompressed = daysLeft !== null && daysLeft < 30 && daysLeft >= 1

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)] focus-visible:outline-none"
        >
          Tell us about your celebration
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Choose the event style and baseline schedule details.
        </p>
      </div>

      {/* Event Type Cards */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[var(--text-primary)] block">
          Event Type <span className="text-[var(--color-accent)]">*</span>
        </label>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          role="radiogroup"
          aria-label="Event type"
        >
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = data.type === opt.type
            return (
              <Card
                key={opt.type}
                variant="interactive"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onChange({ type: opt.type })}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onChange({ type: opt.type })
                  }
                }}
                className={`p-5 flex flex-col justify-between transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--bg-surface-elevated)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xs">
                    {opt.icon}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                        : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-display text-lg font-bold text-[var(--text-primary)] block">
                    {opt.title}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 block">
                    {opt.subtitle}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
        {errors.type && (
          <p role="alert" className="text-xs text-rose-600 font-medium mt-1">
            {errors.type}
          </p>
        )}
      </div>

      {/* Event Name */}
      <Field
        id="wizard-name"
        label="Event Name"
        hint="e.g. Diya & Kabir's Wedding, Aarav's 5th Birthday, Vasant Utsav"
        error={errors.name}
        required
      >
        <Input
          placeholder="Give your celebration a memorable name"
          value={data.name}
          maxLength={100}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>

      {/* Date & City Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Field
            id="wizard-date"
            label="Celebration Date"
            hint="Select celebration day (minimum tomorrow)"
            error={errors.dateISO}
            required
          >
            <div className="relative">
              <Input
                id="wizard-date"
                type="date"
                min={tomorrowISO}
                value={data.dateISO}
                onChange={(e) => onChange({ dateISO: e.target.value })}
              />
              <Calendar
                className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-3.5 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </Field>

          {/* Days Left & Compression Warning */}
          {daysLeft !== null && daysLeft >= 0 && (
            <div className="mt-2 text-xs">
              {isCompressed ? (
                <div
                  role="status"
                  className="flex items-center gap-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 font-medium"
                >
                  <AlertCircle
                    className="w-4 h-4 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  <span>
                    Celebration is in <strong>{daysLeft} days</strong>. A
                    fast-track compressed schedule will be generated.
                  </span>
                </div>
              ) : (
                <span className="text-[var(--text-muted)]">
                  📅 {daysLeft} days from today to prepare
                </span>
              )}
            </div>
          )}
        </div>

        <Field
          id="wizard-city"
          label="City / Location"
          hint="e.g. Pune, Mumbai, London, New York"
          error={errors.city}
          required
        >
          <div className="relative">
            <Input
              id="wizard-city"
              placeholder="City or destination"
              value={data.city}
              maxLength={80}
              onChange={(e) => onChange({ city: e.target.value })}
            />
            <MapPin
              className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-3.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </Field>
      </div>
    </div>
  )
}
