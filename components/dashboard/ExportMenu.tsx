'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useActivePlan, usePlannerStore } from '@/lib/store/plannerStore'
import { buildICS } from '@/lib/engines/icsExport'
import {
  Download,
  Calendar,
  FileJson,
  Upload,
  Printer,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

export interface ExportMenuProps {
  className?: string
}

/**
 * Universal export and backup menu for calendar ICS, complete plan JSON, JSON import, and print view.
 *
 * @param props - Component configuration.
 * @returns Export actions menu.
 */
export function ExportMenu({ className = '' }: ExportMenuProps): React.ReactElement {
  const activePlan = useActivePlan()
  const { importJson } = usePlannerStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 1. Download Calendar (.ics)
  const handleExportIcs = (): void => {
    if (!activePlan) return
    try {
      const icsString = buildICS(activePlan)
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activePlan.profile.name.replace(/[^a-z0-9]/gi, '_')}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setToastMessage('Calendar (.ics) downloaded successfully.')
      setIsOpen(false)
    } catch {
      setToastMessage('Failed to generate calendar file.')
    }
  }

  // 2. Export Plan as JSON
  const handleExportJson = (): void => {
    if (!activePlan) return
    try {
      const jsonString = JSON.stringify(activePlan, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activePlan.profile.name.replace(/[^a-z0-9]/gi, '_')}-blueprint.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setToastMessage('Plan backup (JSON) exported successfully.')
      setIsOpen(false)
    } catch {
      setToastMessage('Failed to export plan JSON.')
    }
  }

  // 3. Trigger Import JSON File Input
  const handleTriggerImport = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        try {
          importJson(content)
          setToastMessage('Plan successfully imported into Festora.')
          setIsOpen(false)
        } catch {
          setToastMessage('Invalid or incompatible plan JSON file.')
        }
      }
    }
    reader.readAsText(file)
    // Reset file input so re-selecting same file works
    e.target.value = ''
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChange}
        aria-label="Upload plan JSON file"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Export or backup celebration plan"
        className="flex items-center gap-1.5 rounded-xl border-[var(--border-subtle)] text-xs font-semibold"
      >
        <Download className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
        <span>Export</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="menu"
            aria-orientation="vertical"
            aria-label="Export and backup options"
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-lg z-50 py-1.5 animate-fade-up focus:outline-none"
          >
            {activePlan && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportIcs}
                  className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <div>
                    <span className="block font-semibold">Calendar (.ics)</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Import to Google or Apple Calendar</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleExportJson}
                  className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <div>
                    <span className="block font-semibold">Export JSON Blueprint</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Save offline backup copy</span>
                  </div>
                </button>

                <Link
                  href="/planner/print"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  <div>
                    <span className="block font-semibold">Print / Save PDF</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Clean black-on-white summary</span>
                  </div>
                </Link>

                <div className="my-1 border-t border-[var(--border-subtle)]" />
              </>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={handleTriggerImport}
              className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div>
                <span className="block font-semibold">Import JSON Blueprint</span>
                <span className="text-[10px] text-[var(--text-muted)]">Restore from backup file</span>
              </div>
            </button>
          </div>
        </>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3500}
        />
      )}
    </div>
  )
}
