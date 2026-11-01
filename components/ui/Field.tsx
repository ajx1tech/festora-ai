'use client'

import React, { createContext, useContext, useId } from 'react'

interface FieldContextValue {
  id: string
  describedBy?: string
  invalid?: boolean
  required?: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/**
 * Hook to access field metadata in custom or nested input primitives.
 *
 * @returns Active field context value or null.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}

export interface FieldProps {
  id?: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Accessible Field component ensuring proper label association, aria-describedby chaining,
 * and error announcements for screen readers.
 *
 * @param props - Field properties.
 * @returns Accessible form field with label, input container, hints, and error feedback.
 */
export function Field({
  id: customId,
  label,
  hint,
  error,
  required = false,
  className = '',
  children,
}: FieldProps): React.ReactElement {
  const generatedId = useId()
  const id = customId || generatedId

  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  const describedByParts = [hintId, errorId].filter(Boolean)
  const describedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined
  const invalid = !!error

  const contextValue: FieldContextValue = {
    id,
    describedBy,
    invalid,
    required,
  }

  return (
    <FieldContext.Provider value={contextValue}>
      <div className={`flex flex-col gap-1.5 w-full ${className}`.trim()}>
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between"
        >
          {label}
          {required && (
            <span
              className="text-[var(--color-accent)] ml-1"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>

        <div className="relative w-full">{children}</div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-[var(--text-muted)] mt-0.5">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}
