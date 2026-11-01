'use client'

import React from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Accessible error boundary view with retry capability.
 *
 * @param props - Component properties containing the error details and reset callback.
 * @returns The rendered error recovery view.
 */
export default function ErrorComponent({
  reset,
}: ErrorProps): React.ReactElement {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="font-[var(--font-family-display)] text-3xl font-bold tracking-tight text-[var(--color-accent)]">
          Something went wrong
        </h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          An unexpected problem occurred while loading this view. You can safely
          try again without losing your saved plan data.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  )
}
