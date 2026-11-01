/**
 * Computes the relative luminance of a sRGB hex color code according to WCAG 2.1 specs.
 *
 * @param hex - 3- or 6-character hex color code (with or without #).
 * @returns Relative luminance value between 0.0 and 1.0.
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '').trim()
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex

  const r = parseInt(fullHex.substring(0, 2), 16) / 255
  const g = parseInt(fullHex.substring(2, 4), 16) / 255
  const b = parseInt(fullHex.substring(4, 6), 16) / 255

  const transform = (v: number): number =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)

  const lr = transform(r)
  const lg = transform(g)
  const lb = transform(b)

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

/**
 * Calculates the contrast ratio between two hex colors according to the WCAG 2.1 formula.
 *
 * @param hexA - First hex color code.
 * @param hexB - Second hex color code.
 * @returns Contrast ratio from 1.0 to 21.0.
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA)
  const lumB = getRelativeLuminance(hexB)

  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determines whether two colors meet the WCAG AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large text).
 *
 * @param foregroundHex - Hex color for foreground text.
 * @param backgroundHex - Hex color for background surface.
 * @param isLargeText - Whether the text is large (>= 18pt or bold >= 14pt).
 * @returns True if the contrast meets or exceeds the WCAG AA threshold.
 */
export function meetsWcagAA(
  foregroundHex: string,
  backgroundHex: string,
  isLargeText: boolean = false
): boolean {
  const threshold = isLargeText ? 3.0 : 4.5
  return contrastRatio(foregroundHex, backgroundHex) >= threshold
}
