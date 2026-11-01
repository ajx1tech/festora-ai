'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Toast } from '@/components/ui/Toast'
import { callAi } from '@/lib/ai/aiClient'
import type { VendorMessageResponse } from '@/lib/ai/aiSchemas'
import type { EventPlan, Vendor } from '@/lib/domain/schemas'
import { fallbackVendorMessage } from '@/lib/engines/fallbackContent'
import {
  Copy,
  Mail,
  MessageCircle,
  RotateCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'

export interface VendorMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendor: Vendor
  plan: EventPlan
}

/**
 * Dialog for generating tailored vendor inquiry and negotiation messages using Gemini AI
 * or deterministic catalog templates with instant fallback, copy, WhatsApp, and email dispatch.
 *
 * @param props - Dialog properties.
 * @returns Accessible dialog modal.
 */
export function VendorMessageDialog({
  open,
  onOpenChange,
  vendor,
  plan,
}: VendorMessageDialogProps): React.ReactElement {
  const fallback = fallbackVendorMessage(plan.profile, vendor)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'gemini' | 'template'>('template')
  const [subject, setSubject] = useState(fallback.subject)
  const [message, setMessage] = useState(fallback.message)
  const [statusText, setStatusText] = useState('')
  const [notes, setNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cooldown on regenerate
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Generate message
  const generateMessage = async (customNotes?: string): Promise<void> => {
    setLoading(true)
    setStatusText('Festora is crafting your vendor outreach message...')

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await callAi<VendorMessageResponse>({
        task: 'vendor_message',
        plan,
        vendorId: vendor.id,
        notes: customNotes ?? notes,
      })

      if (response && response.data) {
        setSubject(response.data.subject)
        setMessage(response.data.message)
        setSource(response.source)
        setStatusText(
          response.source === 'gemini'
            ? 'Message crafted with Gemini AI.'
            : 'Message generated from verified vendor catalog templates.'
        )
      }
    } catch {
      setStatusText('Using offline template due to network error.')
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

  // Copy to clipboard
  const handleCopy = async (): Promise<void> => {
    try {
      const fullText = subject ? `Subject: ${subject}\n\n${message}` : message
      await navigator.clipboard.writeText(fullText)
      setToastMessage('Outreach message copied to clipboard!')
    } catch {
      setToastMessage('Could not copy to clipboard.')
    }
  }

  // Share on WhatsApp
  const handleWhatsApp = (): void => {
    const fullText = subject ? `*${subject}*\n\n${message}` : message
    const url = `https://wa.me/?text=${encodeURIComponent(fullText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Mailto
  const handleMailto = (): void => {
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    window.location.href = url
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Draft Outreach: ${vendor.name}`}
      description="Personalized inquiry crafted with your celebration dates, guest count, and vetting questions."
    >
      <div className="space-y-4 pt-2">
        {/* ARIA Live status region */}
        <div className="sr-only" aria-live="polite">
          {statusText}
        </div>

        {/* Header bar with SourceBadge and Regenerate button */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <SourceBadge source={source} />

          <div className="flex items-center gap-2">
            {loading ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs h-7 px-2.5"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={cooldown > 0}
                onClick={() => void generateMessage()}
                className="text-xs h-7 px-2.5 text-[var(--color-primary)] font-semibold"
                aria-label={cooldown > 0 ? `Regenerate available in ${cooldown} seconds` : 'Regenerate outreach message'}
              >
                <RotateCw className={`w-3 h-3 mr-1 ${cooldown > 0 ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{cooldown > 0 ? `Wait ${cooldown}s` : 'Regenerate'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <span className="text-xs text-[var(--text-muted)] animate-pulse block text-center">
              Festora is tailoring your inquiry message...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Subject input */}
            <div>
              <label htmlFor="vendor-msg-subject" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Subject
              </label>
              <Input
                id="vendor-msg-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry subject line"
              />
            </div>

            {/* Message textarea */}
            <div>
              <label htmlFor="vendor-msg-body" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Message Body (Editable)
              </label>
              <Textarea
                id="vendor-msg-body"
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write or refine your vendor inquiry..."
              />
            </div>

            {/* Optional notes refine input */}
            <div>
              <label htmlFor="vendor-msg-notes" className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Specific request or custom date/time note:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="vendor-msg-notes"
                  value={notes}
                  maxLength={300}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inquiring about outdoor lawn setup availability"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void generateMessage(notes)}
                  disabled={loading || cooldown > 0}
                  className="shrink-0 text-xs font-semibold"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-[var(--color-primary)]" aria-hidden="true" />
                  <span>Update</span>
                </Button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <span>Avoid sensitive personal data. Free-tier AI may be reviewed by Google.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !message}
              onClick={handleCopy}
              className="rounded-xl text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Copy</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !message}
              onClick={handleWhatsApp}
              className="rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>WhatsApp</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || !message}
              onClick={handleMailto}
              className="rounded-xl text-xs font-semibold"
            >
              <Mail className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Email</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}
    </Dialog>
  )
}
