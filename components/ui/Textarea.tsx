'use client'

import React from 'react'
import { useFieldContext } from './Field'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  maxLength?: number
  showCounter?: boolean
}

/**
 * Accessible Textarea primitive with character counter support and focus rings.
 *
 * @param props - Textarea properties.
 * @returns Styled textarea element with optional character counter.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id: customId,
      invalid: customInvalid,
      maxLength,
      showCounter = false,
      value,
      defaultValue,
      className = '',
      onChange,
      ...rest
    },
    ref
  ): React.ReactElement => {
    const fieldContext = useFieldContext()
    const id = customId || fieldContext?.id
    const isInvalid = customInvalid ?? fieldContext?.invalid ?? false

    const [currentLength, setCurrentLength] = React.useState<number>(() => {
      if (typeof value === 'string') return value.length
      if (typeof defaultValue === 'string') return defaultValue.length
      return 0
    })

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setCurrentLength(e.target.value.length)
      onChange?.(e)
    }

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCurrentLength(value.length)
      }
    }, [value])

    const baseStyles =
      'w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-colors duration-200 min-h-[96px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-muted)] resize-y'

    const borderStyles = isInvalid
      ? 'border-rose-500 focus-visible:outline-rose-500'
      : 'border-[var(--border-strong)] focus-visible:outline-[var(--focus-ring)]'

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={id}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={handleChange}
          aria-describedby={fieldContext?.describedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={fieldContext?.required || undefined}
          className={`${baseStyles} ${borderStyles} ${className}`.trim()}
          {...rest}
        />
        {showCounter && maxLength && (
          <div
            className="flex justify-end text-xs text-[var(--text-muted)] mt-1 select-none"
            aria-live="polite"
          >
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
