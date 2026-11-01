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
