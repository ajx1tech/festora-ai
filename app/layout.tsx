import { ToastProvider } from '@/components/ui/Toast'
import { PlannerProvider } from '@/lib/store/plannerStore'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import React from 'react'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Festora AI – Intelligent Event Planning',
  description:
    'GenAI-powered planning assistant for weddings, birthdays, and community events.',
  openGraph: {
    title: 'Festora AI – Intelligent Event Planning',
    description:
      'GenAI-powered planning assistant for weddings, birthdays, and community events.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#141217' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Root application layout establishing design tokens, typography, state store, and accessibility landmarks.
 *
 * @param props - Layout component properties containing child nodes.
 * @returns The root HTML document element.
 */
export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>): React.ReactElement {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--bg-surface)] focus:text-[var(--text-primary)] focus:border focus:border-[var(--border-strong)] focus:rounded-md focus:shadow-md"
        >
          Skip to main content
        </a>
        <PlannerProvider>
          <ToastProvider>{children}</ToastProvider>
        </PlannerProvider>
      </body>
    </html>
  )
}
