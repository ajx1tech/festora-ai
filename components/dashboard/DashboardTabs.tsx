'use client'

import React, { Suspense, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  LayoutDashboard,
  Coins,
  Clock,
  Store,
  Sparkles,
  CalendarDays,
  Send,
  MessageSquareText,
} from 'lucide-react'

// Tab loading skeleton fallback
function TabLoadingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4 py-8 animate-pulse">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  )
}

// Lazy-loaded tab panels
const OverviewTab = dynamic(
  () => import('@/components/dashboard/OverviewTab').then((m) => m.OverviewTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const BudgetTab = dynamic(
  () => import('@/components/dashboard/BudgetTab').then((m) => m.BudgetTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const TimelineTab = dynamic(
  () => import('@/components/dashboard/TimelineTab').then((m) => m.TimelineTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const VendorsTab = dynamic(
  () => import('@/components/dashboard/VendorsTab').then((m) => m.VendorsTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const IdeasTab = dynamic(
  () => import('@/components/ai/IdeasTab').then((m) => m.IdeasTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const RunOfShowTab = dynamic(
  () => import('@/components/ai/RunOfShowTab').then((m) => m.RunOfShowTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const InvitationsTab = dynamic(
  () => import('@/components/ai/InvitationsTab').then((m) => m.InvitationsTab),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)
const AskFestora = dynamic(
  () => import('@/components/ai/AskFestora').then((m) => m.AskFestora),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
)

export const TAB_DEFINITIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, isAi: false },
  { id: 'budget', label: 'Budget', icon: Coins, isAi: false },
  { id: 'timeline', label: 'Timeline', icon: Clock, isAi: false },
  { id: 'vendors', label: 'Vendors', icon: Store, isAi: false },
  { id: 'ideas', label: 'Ideas & Themes', icon: Sparkles, isAi: true },
  { id: 'run_of_show', label: 'Run of Show', icon: CalendarDays, isAi: true },
  { id: 'invitations', label: 'Invitations', icon: Send, isAi: true },
  { id: 'chat', label: 'Ask Festora', icon: MessageSquareText, isAi: true },
] as const

export type TabKey = (typeof TAB_DEFINITIONS)[number]['id']

function DashboardTabsInner(): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTab = (searchParams?.get('tab') as TabKey) || 'overview'

  const handleTabChange = useCallback(
    (tabId: string): void => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set('tab', tabId)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <TabsPrimitive.Root
      value={currentTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      {/* Desktop & Tablet Top Tab Bar */}
      <div className="border-b border-[var(--border-subtle)] pb-px overflow-x-auto no-scrollbar">
        <TabsPrimitive.List
          aria-label="Celebration blueprint navigation"
          className="flex items-center gap-1 min-w-max"
        >
          {TAB_DEFINITIONS.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id

            return (
              <TabsPrimitive.Trigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all tap-target focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-current'
                      : tab.isAi
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-[var(--text-muted)]'
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
                {tab.isAi && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" aria-hidden="true" />
                )}
              </TabsPrimitive.Trigger>
            )
          })}
        </TabsPrimitive.List>
      </div>

      {/* Tab Panels */}
      <TabsPrimitive.Content value="overview" className="focus:outline-none">
        <OverviewTab onTabChange={handleTabChange} />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="budget" className="focus:outline-none">
        <BudgetTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="timeline" className="focus:outline-none">
        <TimelineTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="vendors" className="focus:outline-none">
        <VendorsTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="ideas" className="focus:outline-none">
        <IdeasTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="run_of_show" className="focus:outline-none">
        <RunOfShowTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="invitations" className="focus:outline-none">
        <InvitationsTab />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="chat" className="focus:outline-none">
        <AskFestora />
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  )
}

/**
 * Main accessible dashboard tabs container with URL query synchronization,
 * mobile responsive scroll, and dynamic lazy-loading for active panels.
 *
 * @returns Dashboard tabs component wrapped in Suspense.
 */
export function DashboardTabs(): React.ReactElement {
  return (
    <Suspense fallback={<TabLoadingSkeleton />}>
      <DashboardTabsInner />
    </Suspense>
  )
}
