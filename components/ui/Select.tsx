'use client'

import { ChevronDown } from 'lucide-react'
import React from 'react'
import { useFieldContext } from './Field'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  options?: SelectOption[]
}

/**
 * Accessible native Select component with custom styled chevron.
 * Native select is universally accessible across screen readers and mobile keyboards.
 *
 * @param props - Select properties.
 * @returns Styled select element.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id: customId,
      invalid: customInvalid,
      options,
      className = '',
      children,
      ...rest
    },
    ref
  ): React.ReactElement => {
    const fieldContext = useFieldContext()
    const id = customId || fieldContext?.id
    const isInvalid = customInvalid ?? fieldContext?.invalid ?? false

    const baseStyles =
      'w-full px-4 py-2.5 pr-10 rounded-xl text-sm sm:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border appearance-none transition-colors duration-200 min-h-[44px] tap-target focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

    const borderStyles = isInvalid
      ? 'border-rose-500 focus-visible:outline-rose-500'
      : 'border-[var(--border-strong)] focus-visible:outline-[var(--focus-ring)]'

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={id}
          aria-describedby={fieldContext?.describedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={fieldContext?.required || undefined}
          className={`${baseStyles} ${borderStyles} ${className}`.trim()}
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[var(--text-muted)]"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'
