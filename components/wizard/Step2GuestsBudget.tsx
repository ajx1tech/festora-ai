import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import type { Currency, EventType } from '@/lib/domain/schemas'
import { formatMoney, getBudgetRealismHint } from '@/lib/utils/format'
import { Coins, Sparkles, Users } from 'lucide-react'
import React, { useMemo } from 'react'

export interface Step2Data {
  guests: number
  currency: Currency
  budgetTotal: number
}

export interface Step2GuestsBudgetProps {
  data: Step2Data
  eventType: EventType
  errors?: Partial<Record<keyof Step2Data, string>>
  onChange: (updates: Partial<Step2Data>) => void
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'INR', label: 'INR (₹) – Indian Rupee' },
  { value: 'USD', label: 'USD ($) – US Dollar' },
  { value: 'EUR', label: 'EUR (€) – Euro' },
  { value: 'GBP', label: 'GBP (£) – British Pound' },
]

/**
 * Step 2 of the creation wizard: Guest count, Currency, and Planned Total Budget.
 * Includes synchronized slider/input and live realism advice.
 *
 * @param props - Step2GuestsBudget properties.
 * @returns Accessible form step.
 */
export function Step2GuestsBudget({
  data,
  eventType,
  errors = {},
  onChange,
  headingRef,
}: Step2GuestsBudgetProps): React.ReactElement {
  // Realism hint computation
  const realism = useMemo(() => {
    return getBudgetRealismHint(
      eventType,
      data.currency,
      data.budgetTotal,
      data.guests
    )
  }, [eventType, data.currency, data.budgetTotal, data.guests])

  const perGuestFormatted = useMemo(() => {
    return formatMoney(realism.perGuest, data.currency)
  }, [realism.perGuest, data.currency])

  const handleSliderChange = (vals: number[]): void => {
    const val = vals[0] ?? 50
    onChange({ guests: Math.max(1, Math.min(5000, val)) })
  }

  const handleGuestsNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const parsed = parseInt(e.target.value, 10)
    onChange({
      guests: isNaN(parsed) ? 1 : Math.max(1, Math.min(5000, parsed)),
    })
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const parsed = parseInt(e.target.value, 10)
    onChange({ budgetTotal: isNaN(parsed) ? 0 : Math.max(0, parsed) })
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)] focus-visible:outline-none"
        >
          Scale & Financial Horizon
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Establish the scale of hospitality and spending parameters.
        </p>
      </div>

      {/* Guest Count: Slider + Synchronized Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="wizard-guests-input"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Expected Guests{' '}
            <span className="text-[var(--color-accent)]">*</span>
          </label>
          <div className="w-28">
            <Input
              id="wizard-guests-input"
              type="number"
              min={1}
              max={5000}
              value={data.guests}
              onChange={handleGuestsNumberChange}
              aria-label="Guest count number"
              className="text-right font-semibold"
            />
          </div>
        </div>

        <Slider
          value={[data.guests]}
          onValueChange={handleSliderChange}
          min={1}
          max={1000}
          step={5}
          ariaLabel="Guest count slider"
        />

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Intimate (10)</span>
          <span>Mid-size (250)</span>
          <span>Grand (1000+)</span>
        </div>

        {errors.guests && (
          <p role="alert" className="text-xs text-rose-600 font-medium">
            {errors.guests}
          </p>
        )}
      </div>

      {/* Currency & Budget Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        <div>
          <Field id="wizard-currency" label="Currency" required>
            <Select
              value={data.currency}
              onChange={(e) =>
                onChange({ currency: e.target.value as Currency })
              }
              options={CURRENCIES}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            id="wizard-budget"
            label="Total Planned Budget"
            hint="Set your total target spending ceiling"
            error={errors.budgetTotal}
            required
          >
            <div className="relative">
              <Input
                id="wizard-budget"
                type="number"
                min={100}
                value={data.budgetTotal === 0 ? '' : data.budgetTotal}
                placeholder="e.g. 1500000"
                onChange={handleBudgetChange}
              />
              <Coins
                className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-3.5 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Live Helper & Realism Hint Card */}
      <Card variant="elevated" className="p-5 border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] block">
                Estimated Spend Per Guest
              </span>
              <span className="text-xl font-bold font-display text-[var(--text-primary)]">
                About {perGuestFormatted} / guest
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium">
            <Sparkles
              className="w-3.5 h-3.5 text-[var(--color-primary)]"
              aria-hidden="true"
            />
            <span>
              Tier: <strong className="capitalize">{realism.status}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-subtle)] leading-relaxed">
          💡 {realism.hint}
        </p>
      </Card>
    </div>
  )
}
