'use client'

import { Moon, Sun } from 'lucide-react'
import React, { useSyncExternalStore } from 'react'

export interface ThemeToggleProps {
  className?: string
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('festora_theme')
  if (stored === 'light' || stored === 'dark') return stored
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light'
}

/**
 * Accessible light/dark theme toggle button.
 * Sets document.documentElement[data-theme] and synchronizes via useSyncExternalStore.
 *
 * @param props - ThemeToggle properties.
 * @returns Styled theme switch button.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps): React.ReactElement {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot)

  const toggleTheme = (): void => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('festora_theme', nextTheme)
      window.dispatchEvent(new Event('storage'))
    } catch {
      // Ignore
    }
  }

  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] transition-colors duration-200 tap-target cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`.trim()}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  )
}
