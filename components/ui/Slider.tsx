'use client'

import * as RadixSlider from '@radix-ui/react-slider'
import React from 'react'

export interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  id?: string
  name?: string
  ariaLabel?: string
  className?: string
}

/**
 * Accessible Slider component wrapping @radix-ui/react-slider with custom styling.
 *
 * @param props - Slider properties.
 * @returns Accessible styled range slider.
 */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  id,
  name,
  ariaLabel,
  className = '',
}: SliderProps): React.ReactElement {
  return (
    <RadixSlider.Root
      id={id}
      name={name}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`relative flex items-center select-none touch-none w-full h-8 tap-target ${className}`.trim()}
    >
      <RadixSlider.Track className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] relative grow rounded-full h-2.5">
        <RadixSlider.Range className="absolute bg-[var(--color-primary)] rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-6 h-6 bg-[var(--bg-surface)] border-2 border-[var(--color-primary)] shadow-md rounded-full hover:scale-105 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2 transition-transform duration-150 cursor-grab active:cursor-grabbing"
        aria-label={ariaLabel}
      />
    </RadixSlider.Root>
  )
}
