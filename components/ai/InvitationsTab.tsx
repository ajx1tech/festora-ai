'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Toast } from '@/components/ui/Toast'
import { callAi } from '@/lib/ai/aiClient'
import { useActivePlan } from '@/lib/store/plannerStore'
import type { InvitationResponse } from '@/lib/ai/aiSchemas'
import {
  Copy,
  Mail,
  MessageCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { fallbackInvitation } from '@/lib/engines/fallbackContent'

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal & Traditional' },
  { value: 'heartfelt', label: 'Heartfelt & Warm' },
  { value: 'playful', label: 'Playful & Joyful' },
]

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English', langCode: 'en' },
  { value: 'Hindi', label: 'Hindi (हिंदी)', langCode: 'hi' },
  { value: 'Marathi', label: 'Marathi (मराठी)', langCode: 'mr' },
  { value: 'Spanish', label: 'Spanish (Español)', langCode: 'es' },
  { value: 'French', label: 'French (Français)', langCode: 'fr' },
]

/**
 * Multilingual celebration invitation writer generating twin variants
 * with direct WhatsApp dispatch, mailto links, and language-tagged text.
 *
 * @returns Invitations tab view.
 */
export function InvitationsTab(): React.ReactElement {
  const activePlan = useActivePlan()

  const [tone, setTone] = useState<'formal' | 'playful' | 'heartfelt'>('formal')
  const [language, setLanguage] = useState('English')
  const [hostNames, setHostNames] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [source, setSource] = useState<'gemini' | 'template'>('template')
  const [variants, setVariants] = useState<InvitationResponse | null>(() => {
    if (!activePlan) return null
    const vA = fallbackInvitation(activePlan.profile, 'formal', 'English')
    const vB = fallbackInvitation(activePlan.profile, 'warm', 'English')
    return {
      variantA: { title: vA.title, body: vA.body, rsvp: vA.rsvp },
      variantB: { title: vB.title, body: vB.body, rsvp: vB.rsvp },
    }
  })
  const [cooldown, setCooldown] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Map language name to ISO 639-1 code for HTML lang attribute
  const currentLangCode =
    LANGUAGE_OPTIONS.find((l) => l.value.toLowerCase() === language.toLowerCase())?.langCode ?? 'en'

  // Timer cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Generate invitations
  const generateInvitations = async (): Promise<void> => {
    if (!activePlan) return
    setLoading(true)
    setStatusText(`Festora is crafting ${language} invitation wording in a ${tone} tone...`)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await callAi<InvitationResponse>({
        task: 'invitation',
        plan: activePlan,
        tone,
        language,
      })

      if (response && response.data) {
        setVariants(response.data)
        setSource(response.source)
        setStatusText(
          response.source === 'gemini'
            ? 'Invitations successfully composed with Gemini AI.'
            : 'Invitations generated from verified cultural wording templates.'
        )
      }
    } catch {
      setStatusText('Using offline invitation templates.')
      setSource('template')
    } finally {
      setLoading(false)
      setCooldown(10)
    }
  }

  // Cancel generation
  const handleCancel = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLoading(false)
    setStatusText('Generation cancelled.')
  }

  // Copy invitation text
  const handleCopyVariant = async (title: string, body: string, rsvp: string): Promise<void> => {
    const fullText = `${title}\n\n${body}\n\nRSVP: ${rsvp}`
    try {
      await navigator.clipboard.writeText(fullText)
      setToastMessage('Invitation text copied to clipboard!')
    } catch {
      setToastMessage('Could not copy to clipboard.')
    }
  }

  // Share on WhatsApp
  const handleWhatsAppVariant = (title: string, body: string, rsvp: string): void => {
    const fullText = `*${title}*\n\n${body}\n\n_RSVP: ${rsvp}_`
    const url = `https://wa.me/?text=${encodeURIComponent(fullText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Mailto
  const handleMailtoVariant = (title: string, body: string, rsvp: string): void => {
    const emailBody = `${body}\n\nRSVP: ${rsvp}`
    const url = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = url
  }

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading invitations studio...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ARIA Live status region */}
      <div className="sr-only" aria-live="polite">
        {statusText}
      </div>

      {/* Control Studio Card */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
                Celebration Invitations & WhatsApp Announcements
              </h2>
              <SourceBadge source={source} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Craft culturally authentic invitations in English, Hindi, Marathi, Spanish, or French.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={cooldown > 0}
                onClick={() => void generateInvitations()}
                className="rounded-xl text-xs font-semibold"
                aria-label={cooldown > 0 ? `Regenerate available in ${cooldown}s` : 'Generate invitations'}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Generate Wording'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Inputs Grid: Tone, Language, Host Names */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <label htmlFor="invitation-tone" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Tone of Voice
            </label>
            <Select
              id="invitation-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as 'formal' | 'playful' | 'heartfelt')}
              options={TONE_OPTIONS}
            />
          </div>

          <div>
            <label htmlFor="invitation-language" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Language
            </label>
            <Select
              id="invitation-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={LANGUAGE_OPTIONS.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>

          <div>
            <label htmlFor="invitation-hosts" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Host / Family Names (Optional)
            </label>
            <Input
              id="invitation-hosts"
              value={hostNames}
              onChange={(e) => setHostNames(e.target.value)}
              placeholder="e.g. Sharma Family, Rohan & Ananya"
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Avoid sensitive personal data. Free-tier AI may be reviewed by Google.</span>
        </div>
      </Card>

      {/* Skeletons while generating */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <span className="col-span-full text-xs text-[var(--text-muted)] animate-pulse block text-center">
            Festora is composing your invitation variants in {language}...
          </span>
        </div>
      ) : variants ? (
        /* Two Distinct Variants Side-by-Side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variant A */}
          <Card variant="surface" className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Variant A &bull; {tone === 'formal' ? 'Formal Cadence' : 'Joyful Cadence'}
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                  {language}
                </span>
              </div>

              {/* Rendered text with appropriate lang attribute */}
              <div lang={currentLangCode} className="space-y-3">
                <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                  {variants.variantA.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {variants.variantA.body}
                </p>
                <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-0.5">
                    RSVP Wording
                  </span>
                  <span>{variants.variantA.rsvp}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 mt-6 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyVariant(variants.variantA.title, variants.variantA.body, variants.variantA.rsvp)}
                className="rounded-xl text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Copy</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleWhatsAppVariant(variants.variantA.title, variants.variantA.body, variants.variantA.rsvp)}
                className="rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>WhatsApp</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMailtoVariant(variants.variantA.title, variants.variantA.body, variants.variantA.rsvp)}
                className="rounded-xl text-xs font-semibold"
              >
                <Mail className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Email</span>
              </Button>
            </div>
          </Card>

          {/* Variant B */}
          <Card variant="surface" className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Variant B &bull; Warm & Welcoming
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                  {language}
                </span>
              </div>

              {/* Rendered text with appropriate lang attribute */}
              <div lang={currentLangCode} className="space-y-3">
                <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
                  {variants.variantB.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {variants.variantB.body}
                </p>
                <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-0.5">
                    RSVP Wording
                  </span>
                  <span>{variants.variantB.rsvp}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 mt-6 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyVariant(variants.variantB.title, variants.variantB.body, variants.variantB.rsvp)}
                className="rounded-xl text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Copy</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleWhatsAppVariant(variants.variantB.title, variants.variantB.body, variants.variantB.rsvp)}
                className="rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>WhatsApp</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMailtoVariant(variants.variantB.title, variants.variantB.body, variants.variantB.rsvp)}
                className="rounded-xl text-xs font-semibold"
              >
                <Mail className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <span>Email</span>
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}
    </div>
  )
}
