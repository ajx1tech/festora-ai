'use client'

import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/ui/Confetti'
import type { EventProfile, EventType } from '@/lib/domain/schemas'
import { EventProfileSchema } from '@/lib/domain/schemas'
import { usePlannerStore } from '@/lib/store/plannerStore'
import { ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Step1Basics } from './Step1Basics'
import { Step2GuestsBudget } from './Step2GuestsBudget'
import { Step3StylePreferences } from './Step3StylePreferences'
import { Step4Review } from './Step4Review'
import { WizardHeader } from './WizardHeader'

export const DRAFT_STORAGE_KEY = 'festora_wizard_draft:v1'

const STEP_TITLES = [
  'Celebration Basics',
  'Scale & Financial Horizon',
  'Style, Ambiance & Culture',
  'Review & Assembly',
]

/**
 * 4-Step Celebration Creation Wizard Container.
 * Manages step navigation, sessionStorage draft persistence, validation, and celebration confetti.
 *
 * @returns Complete interactive wizard component.
 */
export function WizardContainer(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createEvent } = usePlannerStore()

  // Initial preselected event type from URL query param if present
  const initialType = (searchParams.get('type') as EventType) || 'wedding'

  // Default empty profile
  const defaultProfile: EventProfile = {
    name: '',
    type: ['wedding', 'birthday', 'community'].includes(initialType)
      ? initialType
      : 'wedding',
    dateISO: '',
    guests: 100,
    budgetTotal:
      initialType === 'wedding'
        ? 1500000
        : initialType === 'birthday'
          ? 50000
          : 250000,
    currency: 'INR',
    city: '',
    venueType: 'indoor',
    vibes: [],
    dietary: [],
    traditions: '',
    priorities: ['venue', 'catering', 'decor'],
  }

  const [profile, setProfile] = useState<EventProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object') {
            return {
              ...defaultProfile,
              ...parsed,
              type: ['wedding', 'birthday', 'community'].includes(parsed.type)
                ? parsed.type
                : defaultProfile.type,
            }
          }
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }
    return defaultProfile
  })

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const announcement = `Step ${currentStep} of 4: ${STEP_TITLES[currentStep - 1]}`

  // Auto-save draft into sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // Ignore
    }
  }, [profile])

  // Move focus to step heading on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      stepHeadingRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [currentStep])

  const updateProfile = (updates: Partial<EventProfile>): void => {
    setProfile((prev) => ({ ...prev, ...updates }))
    // Clear relevant error on change
    if (Object.keys(errors).length > 0) {
      setErrors((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(updates)) {
          delete next[key]
        }
        return next
      })
    }
  }

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!profile.name.trim()) errs.name = 'Please provide an event name.'
    if (!profile.dateISO) {
      errs.dateISO = 'Please select a celebration date.'
    } else {
      const chosen = new Date(profile.dateISO)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (chosen <= today) {
        errs.dateISO = 'Celebration date must be tomorrow or later.'
      }
    }
    if (!profile.city.trim()) errs.city = 'Please specify the city or location.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {}
    if (profile.guests < 1 || profile.guests > 5000) {
      errs.guests = 'Guest count must be between 1 and 5,000.'
    }
    if (profile.budgetTotal <= 0) {
      errs.budgetTotal = 'Planned budget must be greater than zero.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Validate Step 3
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {}
    if (profile.vibes.length > 6) {
      errs.vibes = 'Please select a maximum of 6 vibes.'
    }
    if (profile.traditions && profile.traditions.length > 300) {
      errs.traditions = 'Cultural traditions must be 300 characters or less.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = (): void => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return

    setErrors({})
    setCurrentStep((prev) => Math.min(4, prev + 1))
  }

  const handleBack = (): void => {
    setErrors({})
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  // Final Submit
  const handleSubmit = (): void => {
    // Validate complete profile with Zod
    const result = EventProfileSchema.safeParse(profile)
    if (!result.success) {
      const errMap: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'form'
        errMap[field] = issue.message
      }
      setErrors(errMap)
      return
    }

    setIsSubmitting(true)
    setShowConfetti(true)

    // Clear session storage draft
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // Ignore
    }

    // Create event via store engines
    createEvent(result.data)

    // Route to /planner after celebratory burst
    setTimeout(() => {
      router.push('/planner')
    }, 1200)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Confetti Celebration on Success */}
      <Confetti active={showConfetti} />

      {/* Screen Reader ARIA-Live Announcement */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <WizardHeader
        currentStep={currentStep}
        totalSteps={4}
        stepTitle={STEP_TITLES[currentStep - 1]}
        onBack={handleBack}
        canGoBack={currentStep > 1}
      />

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-lg">
        {currentStep === 1 && (
          <Step1Basics
            data={{
              type: profile.type,
              name: profile.name,
              dateISO: profile.dateISO,
              city: profile.city,
            }}
            errors={errors}
            onChange={updateProfile}
            headingRef={stepHeadingRef}
          />
        )}

        {currentStep === 2 && (
          <Step2GuestsBudget
            data={{
              guests: profile.guests,
              currency: profile.currency,
              budgetTotal: profile.budgetTotal,
            }}
            eventType={profile.type}
            errors={errors}
            onChange={updateProfile}
            headingRef={stepHeadingRef}
          />
        )}

        {currentStep === 3 && (
          <Step3StylePreferences
            data={{
              vibes: profile.vibes,
              dietary: profile.dietary,
              venueType: profile.venueType,
              priorities: profile.priorities,
              traditions: profile.traditions || '',
            }}
            eventType={profile.type}
            errors={errors}
            onChange={updateProfile}
            headingRef={stepHeadingRef}
          />
        )}

        {currentStep === 4 && (
          <Step4Review
            profile={profile}
            errors={errors}
            onSubmit={handleSubmit}
            submitting={isSubmitting}
            headingRef={stepHeadingRef}
          />
        )}

        {/* Step Navigation Controls (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--border-subtle)]">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="px-7"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
