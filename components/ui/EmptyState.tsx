import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

/**
 * Editorial EmptyState presentation with iconography, messaging, and primary action.
 *
 * @param props - EmptyState properties.
 * @returns Accessible empty state container.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-subtle)]/40 ${className}`.trim()}
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--color-primary)] mb-4 shadow-sm"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
