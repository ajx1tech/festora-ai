import { ArrowRight, Cake, Heart, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface EventCardData {
  type: 'wedding' | 'birthday' | 'community'
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: React.ReactNode
  badge: string
  accentColor: string
}

const EVENT_TYPES: EventCardData[] = [
  {
    type: 'wedding',
    title: 'Weddings',
    subtitle: 'From intimate ceremonies to multi-day grand vivahs',
    description:
      'Curated 24-milestone backwards schedule, 10-category balanced budget allocation with contingency buffers, and ritual checklists.',
    features: [
      'Multi-day ceremony tracking (Haldi, Sangeet, Reception)',
      'Vendor contracts & payment milestones',
      'Dual multilingual invitations (English, Hindi, Marathi)',
    ],
    icon: <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    badge: '24 Tasks &bull; 10 Budget Categories',
    accentColor: 'border-rose-200 dark:border-rose-900/50',
  },
  {
    type: 'birthday',
    title: 'Birthdays',
    subtitle: 'Milestone years, themed parties & family gatherings',
    description:
      'Fast-track 16-step timeline focusing on venue booking, custom cake designers, immersive entertainment, and dynamic guest RSVP lists.',
    features: [
      'Tailored per-guest spend analysis',
      'Interactive games & DJ schedule',
      'Playful & heartfelt invitation generator',
    ],
    icon: <Cake className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    badge: '16 Tasks &bull; 8 Budget Categories',
    accentColor: 'border-amber-200 dark:border-amber-900/50',
  },
  {
    type: 'community',
    title: 'Community Festivals',
    subtitle: 'Utsavs, cultural melas & neighborhood celebrations',
    description:
      'Public scale logistics engine with municipal permits, stage AV management, volunteer coordination, and crowd safety protocols.',
    features: [
      'Permits, first aid & sanitation checks',
      'Volunteer rosters & stall management',
      'Hourly run-of-show for public performances',
    ],
    icon: <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
    badge: '18 Tasks &bull; 9 Budget Categories',
    accentColor: 'border-teal-200 dark:border-teal-900/50',
  },
]

/**
 * Event-type selection cards for launching the 4-step wizard preselected.
 *
 * @returns Event-type cards section.
 */
export function EventCards(): React.ReactElement {
  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary)]">
            Tailored Domain Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mt-2">
            Engineered for every scale of celebration
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-3">
            Choose your celebration type to launch a customized blueprint
            calibrated with expert lead times, realistic cost bands, and
            cultural traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EVENT_TYPES.map((evt) => (
            <div
              key={evt.type}
              className={`flex flex-col rounded-2xl p-7 bg-[var(--bg-primary)] border ${evt.accentColor} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xs">
                  {evt.icon}
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                  dangerouslySetInnerHTML={undefined}
                >
                  {evt.badge}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-display text-[var(--text-primary)]">
                {evt.title}
              </h3>
              <p className="text-xs font-medium text-[var(--color-primary)] mt-1 mb-3">
                {evt.subtitle}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                {evt.description}
              </p>

              <ul className="space-y-2 mb-8 mt-auto text-xs sm:text-sm text-[var(--text-muted)]">
                {evt.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/planner/new?type=${evt.type}`}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-fg)] border border-[var(--border-strong)] transition-all tap-target focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>Start {evt.title.toLowerCase()} plan</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
