import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'subtle' | 'interactive'
  children: React.ReactNode
}

/**
 * Editorial card component adhering to the 16px radius design system with subtle shadows.
 *
 * @param props - Card properties.
 * @returns An accessible styled card container.
 */
export function Card({
  variant = 'surface',
  className = '',
  children,
  ...rest
}: CardProps): React.ReactElement {
  const base =
    'rounded-2xl transition-all duration-200 border border-[var(--border-subtle)]'

  const variants = {
    surface: 'bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]',
    elevated: 'bg-[var(--bg-surface-elevated)] shadow-[var(--shadow-md)]',
    subtle: 'bg-[var(--bg-surface-subtle)]',
    interactive:
      'bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] cursor-pointer active:scale-[0.99]',
  }[variant]

  return (
    <div className={`${base} ${variants} ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}
