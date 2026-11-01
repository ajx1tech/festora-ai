import React from 'react'

export interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  showText?: boolean
  className?: string
}

/**
 * Accessible SVG circular progress indicator with ARIA attributes.
 *
 * @param props - ProgressRing properties.
 * @returns SVG circle progress ring with accessible role and labels.
 */
export function ProgressRing({
  value,
  size = 56,
  strokeWidth = 6,
  label = 'Progress',
  showText = true,
  className = '',
}: ProgressRingProps): React.ReactElement {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`relative inline-flex items-center justify-center ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showText && (
        <span
          className="absolute text-xs sm:text-sm font-semibold font-display text-[var(--text-primary)]"
          aria-hidden="true"
        >
          {clampedValue}%
        </span>
      )}
    </div>
  )
}
