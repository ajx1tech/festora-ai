import { Calculator, CheckSquare, Sparkles } from 'lucide-react'
import React from 'react'

interface StepData {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

const STEPS: StepData[] = [
  {
    number: '01',
    title: 'Share your vision and scale',
    description:
      'Answer a 4-step wizard specifying your date, guest count, total budget, vibes, venue style, and cultural traditions.',
    icon: <Calculator className="w-6 h-6 text-[var(--color-primary)]" />,
  },
  {
    number: '02',
    title: 'Instant deterministic blueprint',
    description:
      'Our local algorithms immediately calculate balanced budget allocations, backwards-scheduled milestone deadlines, and vendor tasks. Zero waiting, zero hallucinations.',
    icon: <CheckSquare className="w-6 h-6 text-[var(--color-primary)]" />,
  },
  {
    number: '03',
    title: 'Grounded GenAI enrichment',
    description:
      'Optionally enhance your plan with Gemini: generate bespoke themes, budget-saving tips, vendor outreach drafts, and dual multilingual invitations.',
    icon: <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />,
  },
]

/**
 * Editorial 3-step 'How It Works' walkthrough section.
 *
 * @returns Accessible How It Works component.
 */
export function HowItWorks(): React.ReactElement {
  return (
    <section className="py-16 sm:py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary)]">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mt-2">
            How Festora brings order to celebration
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-3">
            A reliable combination of deterministic math and grounded artificial
            intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col rounded-2xl p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm relative group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-display text-3xl font-bold text-[var(--text-muted)]/40 group-hover:text-[var(--color-primary)] transition-colors">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-[var(--text-primary)] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
