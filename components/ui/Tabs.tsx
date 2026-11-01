'use client'

import * as RadixTabs from '@radix-ui/react-tabs'
import React from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  items: TabItem[]
  ariaLabel?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Accessible Tabs component built on Radix Tabs with responsive horizontal scroll on mobile.
 *
 * @param props - Tabs properties.
 * @returns Accessible tab bar and panels container.
 */
export function Tabs({
  value,
  onValueChange,
  items,
  ariaLabel = 'Navigation tabs',
  className = '',
  children,
}: TabsProps): React.ReactElement {
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={onValueChange}
      className={`w-full ${className}`.trim()}
    >
      <div className="overflow-x-auto no-scrollbar border-b border-[var(--border-subtle)] pb-1">
        <RadixTabs.List
          aria-label={ariaLabel}
          className="flex items-center gap-2 min-w-max p-1"
        >
          {items.map((tab) => (
            <RadixTabs.Trigger
              key={tab.id}
              value={tab.id}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none min-h-[44px] tap-target focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=active]:bg-[var(--bg-surface-elevated)] data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {tab.icon && (
                <span className="shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] font-semibold">
                  {tab.badge}
                </span>
              )}
            </RadixTabs.Trigger>
          ))}
        </RadixTabs.List>
      </div>

      {children}
    </RadixTabs.Root>
  )
}

export const TabContent = RadixTabs.Content
