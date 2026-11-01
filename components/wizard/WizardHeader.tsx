import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

export interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  onBack?: () => void
  canGoBack?: boolean
}

/**
 * Accessible header for the 4-step wizard displaying progress and navigation controls.
 *
 * @param props - WizardHeader properties.
 * @returns Header element with progress bar and step metadata.
 */
export function WizardHeader({
  currentStep,
  totalSteps,
  stepTitle,
  onBack,
  canGoBack = false,
}: WizardHeaderProps): React.ReactElement {
  const percent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go to previous step"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target rounded-lg px-2 -ml-2 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-primary)]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] block">
            {stepTitle}
          </span>
        </div>
      </div>

      <ProgressBar
        value={percent}
        label={`Step ${currentStep} of ${totalSteps}: ${stepTitle}`}
        height={6}
      />
    </div>
  )
}
