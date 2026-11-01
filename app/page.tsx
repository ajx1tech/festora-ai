import { EventCards } from '@/components/landing/EventCards'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TrustStrip } from '@/components/landing/TrustStrip'
import React from 'react'

/**
 * Festora AI Landing Page showcasing event capabilities, deterministic planning, and grounded AI features.
 *
 * @returns Complete landing page view.
 */
export default function Home(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />
      <main id="main-content" className="grow">
        <Hero />
        <EventCards />
        <HowItWorks />
        <FeatureGrid />
        <TrustStrip />
      </main>
      <Footer />
    </div>
  )
}
