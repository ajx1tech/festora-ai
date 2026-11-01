'use client'

import React from 'react'
import { useFieldContext } from './Field'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

/**
 * Accessible text, number, or date Input primitive with styling and focus rings.
 * Respects 44px minimum touch height.
 *
 * @param props - Input properties.
 * @returns Styled input element.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { id: customId, invalid: customInvalid, className = '', ...rest },
    ref
  ): React.ReactElement => {
    const fieldContext = useFieldContext()
    const id = customId || fieldContext?.id
    const isInvalid = customInvalid ?? fieldContext?.invalid ?? false

    const baseStyles =
      'w-full px-4 py-2.5 rounded-xl text-sm sm:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-colors duration-200 min-h-[44px] tap-target focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-muted)]'

    const borderStyles = isInvalid
      ? 'border-rose-500 focus-visible:outline-rose-500'
      : 'border-[var(--border-strong)] focus-visible:outline-[var(--focus-ring)]'

    return (
      <input
        ref={ref}
        id={id}
        aria-describedby={fieldContext?.describedBy}
        aria-invalid={isInvalid || undefined}
        aria-required={fieldContext?.required || undefined}
        className={`${baseStyles} ${borderStyles} ${className}`.trim()}
        {...rest}
      />
    )
  }
)

Input.displayName = 'Input'
