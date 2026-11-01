'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CalendarHeart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

/**
 * Sticky application header with brand logo, theme switcher, and navigation CTA.
 *
 * @returns Accessible header banner element.
 */
export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group tap-target focus-visible:outline-2 focus-visible:outline-offset-2 rounded-xl"
          aria-label="Festora AI Home"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Festora<span className="text-[var(--color-primary)]">.ai</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] -mt-1">
              Celebration Intelligence
            </span>
          </div>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/planner"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-colors tap-target focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <CalendarHeart className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Open planner</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
