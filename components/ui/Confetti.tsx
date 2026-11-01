'use client'

import React, { useEffect, useState } from 'react'

export interface ConfettiProps {
  active?: boolean
  duration?: number
  onComplete?: () => void
}

interface ConfettiPieceData {
  id: number
  left: number
  delay: number
  color: string
  size: number
}

const CONFETTI_COLORS = [
  '#E085BE', // Rose/Plum
  '#FF8A7A', // Coral
  '#ECC276', // Gold
  '#45BFB8', // Teal
  '#B78FF5', // Violet
  '#FDB654', // Amber
]

/**
 * Pure CSS celebratory confetti burst component for plan creation milestones.
 * Automatically disabled under prefers-reduced-motion.
 *
 * @param props - Confetti properties.
 * @returns Floating CSS confetti overlay or null.
 */
export function Confetti({
  active = true,
  duration = 3500,
  onComplete,
}: ConfettiProps): React.ReactElement | null {
  const [pieces] = useState<ConfettiPieceData[]>(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage across viewport
      delay: Math.random() * 0.8, // seconds
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.floor(Math.random() * 6) + 8, // px
    }))
  )
  const [visible, setVisible] = useState<boolean>(true)

  useEffect(() => {
    if (!active) return

    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [active, duration, onComplete])

  if (!active || !visible || pieces.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
