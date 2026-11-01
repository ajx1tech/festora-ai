'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { callAi } from '@/lib/ai/aiClient'
import { useActivePlan } from '@/lib/store/plannerStore'
import type { ChatResponse } from '@/lib/ai/aiSchemas'
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Clock,
  HelpCircle,
} from 'lucide-react'

export interface ChatBubble {
  id: string
  role: 'user' | 'model'
  text: string
  source?: 'gemini' | 'template'
  timestamp: string
}

const STARTER_CHIPS = [
  'What should I do this week?',
  'Am I over budget?',
  'Cheaper decor ideas',
  'What am I forgetting?',
]

/**
 * Plan-aware conversational assistant grounded in current celebration metrics,
 * backwards-scheduled deadlines, and budget allocations with plain text rendering.
 *
 * @returns Ask Festora chat view.
 */
export function AskFestora(): React.ReactElement {
  const activePlan = useActivePlan()

  // Chat message history
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am Festora, your celebration planning assistant. I have full context on your budget allocations, upcoming milestones, and vendor contracts. How can I help you today?',
      source: 'gemini',
      timestamp: 'Just now',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on message updates
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // Countdown for 429 Retry-After
  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setTimeout(() => setRetryAfter((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [retryAfter])

  const idCounterRef = useRef(0)

  const handleSend = async (customPrompt?: string): Promise<void> => {
    const textToSend = (customPrompt ?? input).trim()
    if (!textToSend || loading || retryAfter > 0 || !activePlan) return

    idCounterRef.current += 1
    const userMessage: ChatBubble = {
      id: `user-${idCounterRef.current}`,
      role: 'user',
      text: textToSend,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMessage])
    if (!customPrompt) {
      setInput('')
    }
    setLoading(true)

    // Format last 6 turns for prompt context
    const historyTurns = messages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
    }))

    try {
      const response = await callAi<ChatResponse>({
        task: 'chat',
        plan: activePlan,
        message: textToSend,
        history: historyTurns,
      })

      if (response && response.data) {
        idCounterRef.current += 1
        const botMessage: ChatBubble = {
          id: `bot-${idCounterRef.current}`,
          role: 'model',
          text: response.data.answer,
          source: response.source,
          timestamp: 'Just now',
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (err: unknown) {
      // In case of rate limit, check for status 429
      const errorMessage = err instanceof Error ? err.message : ''
      if (errorMessage.includes('429')) {
        setRetryAfter(30)
      }

      // Safe local fallback
      idCounterRef.current += 1
      const botMessage: ChatBubble = {
        id: `bot-${idCounterRef.current}`,
        role: 'model',
        text: 'I am temporarily unable to reach the cloud AI service. Your plan remains strictly backed by our offline deterministic planning engines.',
        source: 'template',
        timestamp: 'Just now',
      }
      setMessages((prev) => [...prev, botMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  if (!activePlan) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">
        Loading assistant...
      </div>
    )
  }

  return (
    <Card variant="surface" className="flex flex-col h-[650px] overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-[var(--text-primary)]">
              Ask Festora AI Assistant
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Grounded in {activePlan.profile.name} facts & metrics.
            </p>
          </div>
        </div>

        {retryAfter > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rate limit cooling down ({retryAfter}s)</span>
          </div>
        )}
      </div>

      {/* Message List Log */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with Festora AI assistant"
        className="grow overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}
                aria-hidden="true"
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] rounded-tr-none'
                    : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none'
                }`}
              >
                {/* Header row for bot responses */}
                {!isUser && msg.source && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[var(--border-subtle)]">
                    <SourceBadge source={msg.source} />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Plain-text body with whitespace pre-wrap */}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:text-purple-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:text-purple-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:text-purple-400 animate-bounce [animation-delay:0.4s]" />
              <span className="sr-only">Festora is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Bar */}
      <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" aria-hidden="true" />
          <span>Suggestions:</span>
        </span>
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading || retryAfter > 0}
            onClick={() => void handleSend(chip)}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] space-y-2">
        <div className="flex items-center gap-2">
          <div className="grow relative">
            <input
              type="text"
              id="festora-chat-input"
              value={input}
              maxLength={600}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || retryAfter > 0}
              placeholder={retryAfter > 0 ? `Rate limit cooldown: wait ${retryAfter}s...` : 'Ask Festora about your budget, vendors, or timeline...'}
              aria-label="Message to Festora AI"
              className="w-full px-4 py-2.5 pr-16 text-xs sm:text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-60"
            />
            <span className="absolute right-3 top-3 text-[10px] text-[var(--text-muted)]">
              {input.length}/600
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => void handleSend()}
            disabled={!input.trim() || loading || retryAfter > 0}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0"
            aria-label="Send message to Festora"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:ml-1.5">Send</span>
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Avoid sensitive personal data. Free-tier AI may be reviewed by Google.</span>
        </div>
      </div>
    </Card>
  )
}
