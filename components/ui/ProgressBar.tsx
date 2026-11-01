import React from 'react'

export interface ProgressBarProps {
  value: number
  label?: string
  height?: number
  showText?: boolean
  className?: string
}

/**
 * Accessible linear progress bar with ARIA progressbar semantics.
 *
 * @param props - ProgressBar properties.
 * @returns Styled linear progress bar element.
 */
export function ProgressBar({
  value,
  label = 'Progress',
  height = 8,
  showText = false,
  className = '',
}: ProgressBarProps): React.ReactElement {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={`w-full ${className}`.trim()}>
      {showText && (
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1.5">
          <span>{label}</span>
          <span className="font-semibold">{clampedValue}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
