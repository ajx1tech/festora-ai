import { Code2, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

/**
 * Semantic application footer with GitHub repository link and accessibility information.
 *
 * @returns Semantic footer element.
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="w-full bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-fg)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="font-display text-lg font-bold text-[var(--text-primary)]">
              Festora<span className="text-[var(--color-primary)]">.ai</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] border-l border-[var(--border-strong)] pl-3">
              Crafted for family celebrations everywhere
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-6 text-sm text-[var(--text-secondary)]"
          >
            <Link
              href="/"
              className="hover:text-[var(--text-primary)] transition-colors tap-target"
            >
              Home
            </Link>
            <Link
              href="/planner"
              className="hover:text-[var(--text-primary)] transition-colors tap-target"
            >
              Planner
            </Link>
            <Link
              href="/planner/new"
              className="hover:text-[var(--text-primary)] transition-colors tap-target"
            >
              New Plan
            </Link>
          </nav>

          {/* External Links */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              Built with{' '}
              <Heart
                className="w-3.5 h-3.5 text-rose-500 fill-rose-500"
                aria-hidden="true"
              />{' '}
              for Google GenAI Hackathon
            </span>
            <a
              href="https://github.com/ajx1tech/festora-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Festora AI GitHub Repository"
              className="inline-flex items-center gap-1.5 p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors tap-target"
            >
              <Code2 className="w-4 h-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Festora AI. All event data resides
          strictly inside your browser session.
        </div>
      </div>
    </footer>
  )
}
