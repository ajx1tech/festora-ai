import { Check } from 'lucide-react'
import React from 'react'

export interface ChipProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'onToggle'
  > {
  selected?: boolean
  onToggle?: (selected: boolean) => void
  children: React.ReactNode
}

/**
 * Accessible toggle Chip primitive utilizing aria-pressed for multi-select and preference grouping.
 * Complies with 44px minimum tap targets.
 *
 * @param props - Chip properties.
 * @returns An accessible toggleable button element.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      selected = false,
      onToggle,
      disabled = false,
      className = '',
      children,
      onClick,
      ...rest
    },
    ref
  ): React.ReactElement => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      if (disabled) return
      onToggle?.(!selected)
      onClick?.(e)
    }

    const base =
      'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed tap-target cursor-pointer'

    const stateStyles = selected
      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-sm'
      : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]'

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={handleClick}
        className={`${base} ${stateStyles} ${className}`.trim()}
        {...rest}
      >
        {selected && (
          <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        )}
        <span>{children}</span>
      </button>
    )
  }
)

Chip.displayName = 'Chip'
