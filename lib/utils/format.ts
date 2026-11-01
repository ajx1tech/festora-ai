import type { Currency } from '@/lib/domain/schemas'

/**
 * Formats a monetary amount into a localized currency string.
 *
 * @param amount - The numeric monetary value to format.
 * @param currency - The currency code (INR, USD, EUR, GBP).
 * @returns The formatted currency string.
 */
export function formatMoney(amount: number, currency: Currency): string {
  const localeMap: Record<Currency, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  }

  const locale = localeMap[currency] ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formats an ISO date string into a localized human-readable date.
 *
 * @param dateISO - ISO formatted date string (e.g. YYYY-MM-DD).
 * @param locale - BCP 47 language tag for localization.
 * @returns Formatted human-readable date string.
 */
export function formatDate(dateISO: string, locale: string = 'en-US'): string {
  const date = new Date(dateISO)
  if (isNaN(date.getTime())) {
    return dateISO
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * Formats a number into compact notation (e.g., 1.5K, 2M).
 *
 * @param num - The number to format.
 * @param locale - BCP 47 language tag for localization.
 * @returns Compact formatted number string.
 */
export function formatCompactNumber(
  num: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export interface BudgetRealism {
  perGuest: number
  status: 'modest' | 'balanced' | 'luxury'
  hint: string
}

/**
 * Calculates per-guest budget and compares against typical industry ranges for event realism hints.
 *
 * @param type - Event type (wedding, birthday, community).
 * @param currency - Currency (INR, USD, EUR, GBP).
 * @param totalBudget - Total planned budget.
 * @param guests - Expected guest count.
 * @returns Realism analysis containing per-guest value, tier classification, and human guidance.
 */
export function getBudgetRealismHint(
  type: 'wedding' | 'birthday' | 'community',
  currency: Currency,
  totalBudget: number,
  guests: number
): BudgetRealism {
  const safeGuests = Math.max(1, guests)
  const perGuest = Math.round(totalBudget / safeGuests)

  // Benchmarks in INR vs Western Currencies (USD/EUR/GBP)
  const isINR = currency === 'INR'

  const ranges = {
    wedding: isINR
      ? { low: 3500, high: 15000, bandStr: '₹3,500 – ₹15,000' }
      : { low: 150, high: 600, bandStr: '150 – 600' },
    birthday: isINR
      ? { low: 600, high: 3000, bandStr: '₹600 – ₹3,000' }
      : { low: 30, high: 150, bandStr: '30 – 150' },
    community: isINR
      ? { low: 250, high: 1500, bandStr: '₹250 – ₹1,500' }
      : { low: 15, high: 80, bandStr: '15 – 80' },
  }[type]

  if (perGuest < ranges.low) {
    return {
      perGuest,
      status: 'modest',
      hint: `Modest tier for a ${type} (typical: ${ranges.bandStr}/guest). Focus budget on venue and catering essentials.`,
    }
  }

  if (perGuest > ranges.high) {
    return {
      perGuest,
      status: 'luxury',
      hint: `Luxury tier for a ${type} (typical: ${ranges.bandStr}/guest). Generous leeway for bespoke decor, live artists, and photography.`,
    }
  }

  return {
    perGuest,
    status: 'balanced',
    hint: `Well-balanced tier for a ${type} (typical: ${ranges.bandStr}/guest). Ample coverage across all core categories.`,
  }
}
