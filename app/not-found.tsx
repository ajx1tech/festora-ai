import Link from 'next/link'
import React from 'react'

/**
 * Accessible 404 Not Found page for unresolved routes.
 *
 * @returns The rendered not found view.
 */
export default function NotFound(): React.ReactElement {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="font-[var(--font-family-display)] text-4xl font-bold tracking-tight text-[var(--color-primary)]">
          404 - Page Not Found
        </h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          We could not find the page you are looking for. Let us guide you back
          to your celebration planning.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
