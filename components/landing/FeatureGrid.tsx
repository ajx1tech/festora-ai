import {
  CalendarClock,
  Globe2,
  Lightbulb,
  MessageSquareQuote,
  MessagesSquare,
  PieChart,
} from 'lucide-react'
import React from 'react'

interface FeatureItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const FEATURES: FeatureItem[] = [
  {
    id: 'budget',
    title: 'Smart Budget Engine',
    description:
      'Zero-drift category allocations with largest-remainder rounding and dynamic contingency buffers. Lock individual categories and watch the engine rebalance others automatically.',
    icon: (
      <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  {
    id: 'timeline',
    title: 'Backwards Scheduled Timeline',
    description:
      'Milestones scheduled in reverse from celebration day to today. Dynamic phase grouping and automatic compressed schedules for events under 30 days away.',
    icon: (
      <CalendarClock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
    ),
  },
  {
    id: 'vendors',
    title: 'Vendor Tracker & WhatsApp Generator',
    description:
      'Track contracts, status, and quotes by category. Generate tailored, professional WhatsApp messages with non-sensitive event specs in seconds.',
    icon: (
      <MessageSquareQuote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
    ),
  },
  {
    id: 'ai-ideas',
    title: 'Curated AI Ideas & Saving Tips',
    description:
      'Bespoke celebration concepts, creative themes, and actionable cost-saving recommendations tailored to your event profile and priorities.',
    icon: (
      <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    ),
  },
  {
    id: 'invitations',
    title: 'Multilingual Dual Invitations',
    description:
      'Generate formal and playful invitation variants in English, Hindi, and Marathi. Grounded in your rituals and free of generic filler text.',
    icon: <Globe2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
  },
  {
    id: 'assistant',
    title: 'Plan-Aware AI Assistant',
    description:
      'Chat directly with an AI planning assistant strictly grounded in your actual event numbers. It answers factual status questions and refuses ungrounded speculation.',
    icon: (
      <MessagesSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
    ),
  },
]

/**
 * Editorial 6-tile feature grid highlighting core planner capabilities.
 *
 * @returns Feature grid section.
 */
export function FeatureGrid(): React.ReactElement {
  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary)]">
            Comprehensive Toolkit
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mt-2">
            Every tool you need to celebrate with peace of mind
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-3">
            Built from scratch to prioritize precision, accessibility, and
            graceful offline reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="flex flex-col rounded-2xl p-7 bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 shadow-xs">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold font-display text-[var(--text-primary)] mb-2.5">
                {feat.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
