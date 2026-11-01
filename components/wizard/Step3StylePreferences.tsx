import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Field } from '@/components/ui/Field'
import { Textarea } from '@/components/ui/Textarea'
import type {
  BudgetCategoryId,
  EventType,
  VenueType,
} from '@/lib/domain/schemas'
import { Building2, Compass, SunDim, Trees } from 'lucide-react'
import React from 'react'

export interface Step3Data {
  vibes: string[]
  dietary: string[]
  venueType: VenueType
  priorities: BudgetCategoryId[]
  traditions: string
}

export interface Step3StylePreferencesProps {
  data: Step3Data
  eventType: EventType
  errors?: Partial<Record<keyof Step3Data, string>>
  onChange: (updates: Partial<Step3Data>) => void
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

const VIBE_CATALOG: Record<EventType, string[]> = {
  wedding: [
    'Royal Traditional',
    'Warm Family Hospitality',
    'Floral & Botanical',
    'Modern Glamour',
    'Minimalist Intimate',
    'Sunset Bohemian',
    'Festive Sangeet Energy',
    'Heritage Palace',
  ],
  birthday: [
    'Speakeasy Chic',
    'Neon Dance Party',
    'Cozy Garden Gathering',
    'Retro 90s Throwback',
    'Luxury Dinner & Lounge',
    'Carnival & Games',
    'Acoustic Rooftop',
  ],
  community: [
    'Lively Cultural Heritage',
    'Vibrant Festive Lights',
    'Family Friendly',
    'Youth Creative Arts',
    'Eco-Friendly Green',
    'Traditional Folk & Music',
    'Charity & Community Service',
  ],
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Jain',
  'Halal',
  'Gluten-free',
  'Kosher',
]

const VENUE_OPTIONS: {
  type: VenueType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    type: 'indoor',
    title: 'Indoor Hall',
    subtitle: 'Climate controlled banquet or ballroom',
    icon: <Building2 className="w-5 h-5 text-indigo-500" />,
  },
  {
    type: 'outdoor',
    title: 'Outdoor Lawn',
    subtitle: 'Open sky garden, beach, or rooftop',
    icon: <Trees className="w-5 h-5 text-emerald-500" />,
  },
  {
    type: 'hybrid',
    title: 'Hybrid Venue',
    subtitle: 'Connected indoor hall and outdoor courtyard',
    icon: <SunDim className="w-5 h-5 text-amber-500" />,
  },
]

const PRIORITY_OPTIONS: { id: BudgetCategoryId; label: string }[] = [
  { id: 'venue', label: 'Venue & Spaces' },
  { id: 'catering', label: 'Food & Catering' },
  { id: 'decor', label: 'Decor & Florals' },
  { id: 'photography', label: 'Photography & Film' },
  { id: 'music', label: 'Music & DJ' },
  { id: 'attire', label: 'Attire & Styling' },
  { id: 'entertainment', label: 'Entertainment & Acts' },
  { id: 'cake', label: 'Signature Cake' },
]

/**
 * Step 3 of the creation wizard: Vibes, Dietary, Venue Type, Priorities, and Cultural Traditions.
 *
 * @param props - Step3StylePreferences properties.
 * @returns Accessible form step.
 */
export function Step3StylePreferences({
  data,
  eventType,
  errors = {},
  onChange,
  headingRef,
}: Step3StylePreferencesProps): React.ReactElement {
  const availableVibes = VIBE_CATALOG[eventType] || VIBE_CATALOG.wedding

  const toggleVibe = (vibe: string): void => {
    const isSelected = data.vibes.includes(vibe)
    if (isSelected) {
      onChange({ vibes: data.vibes.filter((v) => v !== vibe) })
    } else {
      if (data.vibes.length >= 6) return
      onChange({ vibes: [...data.vibes, vibe] })
    }
  }

  const toggleDietary = (item: string): void => {
    const isSelected = data.dietary.includes(item)
    if (isSelected) {
      onChange({ dietary: data.dietary.filter((d) => d !== item) })
    } else {
      if (data.dietary.length >= 6) return
      onChange({ dietary: [...data.dietary, item] })
    }
  }

  const togglePriority = (pId: BudgetCategoryId): void => {
    const isSelected = data.priorities.includes(pId)
    if (isSelected) {
      onChange({ priorities: data.priorities.filter((p) => p !== pId) })
    } else {
      if (data.priorities.length >= 3) return
      onChange({ priorities: [...data.priorities, pId] })
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-primary)] focus-visible:outline-none"
        >
          Style, Ambiance & Culture
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Infuse your personality and traditions to calibrate vendor suggestions
          and AI ideas.
        </p>
      </div>

      {/* Vibe Selection Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Aesthetic Vibes{' '}
            <span className="text-xs font-normal text-[var(--text-muted)]">
              (Choose up to 6 &bull; {data.vibes.length}/6 selected)
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {availableVibes.map((vibe) => (
            <Chip
              key={vibe}
              selected={data.vibes.includes(vibe)}
              onToggle={() => toggleVibe(vibe)}
            >
              {vibe}
            </Chip>
          ))}
        </div>
        {errors.vibes && (
          <p role="alert" className="text-xs text-rose-600 font-medium">
            {errors.vibes}
          </p>
        )}
      </div>

      {/* Dietary Chips */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[var(--text-primary)]">
          Dietary Requirements{' '}
          <span className="text-xs font-normal text-[var(--text-muted)]">
            (Select guest food preferences)
          </span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {DIETARY_OPTIONS.map((item) => (
            <Chip
              key={item}
              selected={data.dietary.includes(item)}
              onToggle={() => toggleDietary(item)}
            >
              {item}
            </Chip>
          ))}
        </div>
      </div>

      {/* Venue Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[var(--text-primary)] block">
          Venue Setting <span className="text-[var(--color-accent)]">*</span>
        </label>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          role="radiogroup"
          aria-label="Venue setting"
        >
          {VENUE_OPTIONS.map((vOpt) => {
            const isSelected = data.venueType === vOpt.type
            return (
              <Card
                key={vOpt.type}
                variant="interactive"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onChange({ venueType: vOpt.type })}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onChange({ venueType: vOpt.type })
                  }
                }}
                className={`p-4 flex flex-col justify-between transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--bg-surface-elevated)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-3 shadow-xs">
                  {vOpt.icon}
                </div>
                <div>
                  <span className="font-display text-base font-bold text-[var(--text-primary)] block">
                    {vOpt.title}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                    {vOpt.subtitle}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Top 3 Priorities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Priority Spending Areas{' '}
            <span className="text-xs font-normal text-[var(--text-muted)]">
              (Choose up to 3 to bias budget engine &bull;{' '}
              {data.priorities.length}/3)
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {PRIORITY_OPTIONS.map((pOpt) => (
            <Chip
              key={pOpt.id}
              selected={data.priorities.includes(pOpt.id)}
              onToggle={() => togglePriority(pOpt.id)}
            >
              <Compass className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              {pOpt.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Cultural Traditions Free Text */}
      <div>
        <Field
          id="wizard-traditions"
          label="Cultural Traditions & Special Rituals"
          hint="Mention key rituals, family customs, or specific ceremonies (max 300 characters)"
          error={errors.traditions}
        >
          <Textarea
            value={data.traditions}
            maxLength={300}
            showCounter
            placeholder="e.g. Haldi ceremony on day 1, traditional wedding vows, cake cutting with surprise acoustic serenade, followed by dinner banquet."
            onChange={(e) => onChange({ traditions: e.target.value })}
          />
        </Field>
      </div>
    </div>
  )
}
