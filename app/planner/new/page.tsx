'use client'

import { WizardContainer } from '@/components/wizard/WizardContainer'
import React, { Suspense } from 'react'

/**
 * Creation Wizard Page for assembling new celebration plans.
 * Wrapped in Suspense for search params dynamic access.
 *
 * @returns Wizard page view.
 */
export default function NewEventPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-8 text-center text-[var(--text-muted)] animate-pulse">
          Loading creation wizard...
        </div>
      }
    >
      <WizardContainer />
    </Suspense>
  )
}
