import { Loader2 } from 'lucide-react'
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

/**
 * Accessible Button component with multiple visual variants and loading state.
 * Guaranteed 44px minimum tap target for touch devices.
 *
 * @param props - Button properties.
 * @returns An accessible styled HTML button element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      children,
      ...rest
    },
    ref
  ): React.ReactElement => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none tap-target'

    const sizeStyles = {
      sm: 'text-sm px-3.5 py-1.5 gap-1.5 min-h-[44px]',
      md: 'text-sm sm:text-base px-5 py-2.5 gap-2 min-h-[44px]',
      lg: 'text-base sm:text-lg px-7 py-3 gap-2.5 min-h-[48px]',
    }[size]

    const variantStyles = {
      primary:
        'bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-sm active:scale-[0.98]',
      secondary:
        'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] active:scale-[0.98]',
      ghost:
        'text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] active:scale-[0.98]',
      outline:
        'border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] active:scale-[0.98]',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]',
    }[variant]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? 'true' : undefined}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
        {...rest}
      >
        {loading && (
          <Loader2
            className="w-4 h-4 animate-spin motion-reduce:hidden"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
