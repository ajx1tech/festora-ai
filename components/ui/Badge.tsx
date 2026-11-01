import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'subtle' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

/**
 * Editorial Badge indicator for statuses, categories, and metrics.
 *
 * @param props - Badge properties.
 * @returns Styled badge element.
 */
export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}: BadgeProps): React.ReactElement {
  const base = 'inline-flex items-center font-medium rounded-full select-none'

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5',
  }[size]

  const variants = {
    default:
      'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    accent:
      'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-semibold',
    subtle: 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)]',
    outline:
      'border border-[var(--border-strong)] text-[var(--text-secondary)]',
    success:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
  }[variant]

  return (
    <span
      className={`${base} ${sizes} ${variants} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  )
}
