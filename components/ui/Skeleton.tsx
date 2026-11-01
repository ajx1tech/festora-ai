import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  circle?: boolean
}

/**
 * Accessible shimmer skeleton placeholder for loading states.
 * Suppressed from screen readers via aria-hidden.
 *
 * @param props - Skeleton properties.
 * @returns Styled skeleton shimmer element.
 */
export function Skeleton({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...rest
}: SkeletonProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className={`bg-[var(--bg-surface-elevated)] animate-pulse ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`.trim()}
      style={{
        width,
        height,
        ...style,
      }}
      {...rest}
    />
  )
}
