import React from 'react'

export interface DonutSegment {
  id: string
  label: string
  value: number
  color: string
}

export interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
  title?: string
  className?: string
}

/**
 * Pure SVG multi-segment Donut Chart with accessible text table fallback.
 * Strictly avoids third-party charting libraries as per engineering constraints.
 *
 * @param props - DonutChart properties.
 * @returns SVG donut visualization alongside an accessible screen-reader table.
 */
export function DonutChart({
  segments,
  size = 200,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  title = 'Budget breakdown by category',
  className = '',
}: DonutChartProps): React.ReactElement {
  const total = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`.trim()}>
      {/* Visual SVG Donut */}
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {total > 0 &&
            segments.map((seg) => {
              const fraction = seg.value / total
              const strokeDasharray = `${fraction * circumference} ${circumference}`
              const strokeDashoffset = -accumulatedPercent * circumference
              accumulatedPercent += fraction

              return (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  fill="none"
                  className="transition-all duration-300"
                />
              )
            })}
        </svg>

        {(centerLabel || centerValue) && (
          <div className="absolute text-center flex flex-col items-center justify-center p-2">
            {centerValue && (
              <span className="text-base sm:text-lg font-bold font-display text-[var(--text-primary)]">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-[var(--text-muted)]">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Visual Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-xs">
        {segments.map((seg) => {
          const percent = total > 0 ? Math.round((seg.value / total) * 100) : 0
          return (
            <div key={seg.id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
                aria-hidden="true"
              />
              <span className="truncate text-[var(--text-secondary)]">
                {seg.label}
              </span>
              <span className="ml-auto font-medium text-[var(--text-primary)]">
                {percent}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Accessible Screen-Reader Data Table */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Amount</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => {
            const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0'
            return (
              <tr key={seg.id}>
                <td>{seg.label}</td>
                <td>{seg.value}</td>
                <td>{pct}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
