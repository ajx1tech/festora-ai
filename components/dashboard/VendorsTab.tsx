'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { VendorMessageDialog } from '@/components/ai/VendorMessageDialog'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import { VENDOR_CATALOG, vendorProgress, committedSpend } from '@/lib/engines/vendorEngine'
import { formatMoney } from '@/lib/utils/format'
import type { Vendor } from '@/lib/domain/schemas'
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'researching', label: 'Researching' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quote Received' },
  { value: 'booked', label: 'Booked / Contracted' },
  { value: 'paid', label: 'Advance Paid' },
]

/**
 * Vendor relationship and contracting dashboard. Tracks quotes, lead times,
 * vetted interview questions, and generates AI vendor outreach messages.
 *
 * @returns Vendors tab view.
 */
export function VendorsTab(): React.ReactElement {
  const activePlan = useActivePlan()
  const { updateVendor } = usePlannerStore()

  // Selected vendor for AI outreach dialog
  const [activeVendorForMessage, setActiveVendorForMessage] = useState<Vendor | null>(null)

  // Expanded questions per vendor ID
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading vendor checklist...
      </div>
    )
  }

  const { profile, vendors } = activePlan
  const catalog = VENDOR_CATALOG[profile.type] ?? []
  const progress = vendorProgress(vendors, profile.type)
  const totalCommitted = committedSpend(vendors)

  const toggleQuestions = (vendorId: string): void => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }))
  }

  const handleStatusChange = (vendor: Vendor, nextStatus: string): void => {
    updateVendor({
      ...vendor,
      status: nextStatus as Vendor['status'],
    })
  }

  const handleNameChange = (vendor: Vendor, nextName: string): void => {
    updateVendor({
      ...vendor,
      name: nextName,
    })
  }

  const handleQuoteChange = (vendor: Vendor, nextQuoteStr: string): void => {
    const num = parseInt(nextQuoteStr, 10)
    updateVendor({
      ...vendor,
      quote: isNaN(num) || num < 0 ? 0 : num,
    })
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Summary & Progress Banner */}
      <Card variant="surface" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
              Vendor Contracts & Outreach
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Track contract negotiations, advance payments, and interview questions tailored for {profile.city}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Committed Value
              </span>
              <span className="text-lg font-bold font-display text-[var(--color-primary)]">
                {formatMoney(totalCommitted, profile.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {progress.bookedOrPaid} of {progress.total} Vendors Booked ({progress.percent}%)
            </span>
            {progress.criticalUnbooked > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{progress.criticalUnbooked} critical vendor(s) pending</span>
              </span>
            )}
          </div>
          <ProgressBar
            value={progress.percent}
            height={8}
            label="Overall vendor booking velocity"
          />
        </div>
      </Card>

      {/* Vendors List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor) => {
          const catalogEntry = catalog.find((c) => c.category === vendor.category)
          const isCritical = catalogEntry?.critical ?? false
          const leadDays = catalogEntry?.typicalLeadDays ?? 120
          const questions = catalogEntry?.questionsToAsk ?? []
          const areQuestionsOpen = Boolean(expandedQuestions[vendor.id])
          const isBooked = vendor.status === 'booked' || vendor.status === 'paid'

          return (
            <Card
              key={vendor.id}
              variant="surface"
              className={`p-5 flex flex-col justify-between transition-colors ${
                isBooked
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isCritical
                  ? 'border-[var(--border-subtle)]'
                  : 'border-[var(--border-subtle)]'
              }`}
            >
              <div>
                {/* Header row: category name & lead time hint */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold font-display text-[var(--text-primary)] capitalize">
                        {catalogEntry?.label ?? vendor.category}
                      </span>
                      {isCritical && (
                        <Badge
                          variant="warning"
                          className="text-[10px] py-0 px-1.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                        >
                          Critical
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--color-primary)]" aria-hidden="true" />
                      <span>Book ~{leadDays} days prior</span>
                    </span>
                  </div>

                  {/* Draft Message Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveVendorForMessage(vendor)}
                    className="rounded-xl text-xs font-semibold shrink-0"
                    aria-label={`Draft outreach inquiry for ${vendor.name || vendor.category}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" aria-hidden="true" />
                    <span>Draft Inquiry</span>
                  </Button>
                </div>

                {/* Form fields: Vendor Name, Quote, Status */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`vendor-name-${vendor.id}`}
                        className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
                      >
                        Vendor Name
                      </label>
                      <Input
                        id={`vendor-name-${vendor.id}`}
                        value={vendor.name}
                        onChange={(e) => handleNameChange(vendor, e.target.value)}
                        placeholder="e.g. Royal Palace Banquets"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`vendor-quote-${vendor.id}`}
                        className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
                      >
                        Quote ({profile.currency})
                      </label>
                      <Input
                        id={`vendor-quote-${vendor.id}`}
                        type="number"
                        min="0"
                        value={vendor.quote || ''}
                        onChange={(e) => handleQuoteChange(vendor, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`vendor-status-${vendor.id}`}
                      className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1"
                    >
                      Negotiation Status
                    </label>
                    <Select
                      id={`vendor-status-${vendor.id}`}
                      value={vendor.status}
                      onChange={(e) => handleStatusChange(vendor, e.target.value)}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>

                {/* Collapsible Questions to Ask Checklist */}
                {questions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => toggleQuestions(vendor.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                      aria-expanded={areQuestionsOpen}
                      aria-label="Toggle vetting questions to ask"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Key Questions to Ask ({questions.length})</span>
                      </span>
                      {areQuestionsOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>

                    {areQuestionsOpen && (
                      <ul className="mt-2.5 space-y-1.5 pl-4 list-disc text-xs text-[var(--text-secondary)] animate-fade-up">
                        {questions.map((q, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {q}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Status footer banner */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                {isBooked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Contract active ({formatMoney(vendor.quote, profile.currency)})</span>
                  </span>
                ) : (
                  <span>Status: <strong className="capitalize text-[var(--text-primary)]">{vendor.status}</strong></span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Vendor Message AI Dialog */}
      {activeVendorForMessage && (
        <VendorMessageDialog
          open={Boolean(activeVendorForMessage)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setActiveVendorForMessage(null)
          }}
          vendor={activeVendorForMessage}
          plan={activePlan}
        />
      )}
    </div>
  )
}
