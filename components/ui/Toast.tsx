'use client'

import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import React, { createContext, useContext, useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

interface ToastContextValue {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Hook to trigger toast notifications anywhere in the app.
 *
 * @returns Toast dispatch function.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      showToast: () => {},
    }
  }
  return ctx
}

export interface ToastProviderProps {
  children: React.ReactNode
}

/**
 * Toast provider establishing an aria-live polite region for screen reader announcements.
 *
 * @param props - Provider children.
 * @returns Accessible toast provider and viewport container.
 */
export function ToastProvider({
  children,
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (
    text: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, text, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-xl shadow-lg animate-fade-up motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {toast.type === 'error' && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] tap-target cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
