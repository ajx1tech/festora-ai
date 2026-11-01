import React from 'react'

/**
 * Root landing page placeholder for Festora AI.
 *
 * @returns The rendered main view placeholder.
 */
export default function Home(): React.ReactElement {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 shadow-[var(--shadow-md)]">
        <h1 className="font-[var(--font-family-display)] text-4xl font-bold tracking-tight text-[var(--color-primary)]">
          Festora AI
        </h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          GenAI-powered planning assistant for weddings, birthdays, and
          community events.
        </p>
      </div>
    </main>
  )
}
