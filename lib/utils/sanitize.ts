/**
 * Strips non-printable ASCII control characters except standard whitespace.
 *
 * @param input - The raw input text.
 * @returns Sanitized text with control characters removed.
 */
export function stripControlChars(input: string): string {
  // Removes ASCII control characters 0-31 (except tab \x09 and newline \x0A) and 127 DEL
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Collapses repetitive whitespace into single spaces and trims leading/trailing spaces.
 *
 * @param input - The text with potential irregular whitespace.
 * @returns Trimmed string with standardized single whitespace.
 */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if trimmed.
 *
 * @param input - The string to truncate.
 * @param maxLength - Maximum permitted character count before ellipsis.
 * @returns Truncated string within maximum length bounds.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input
  }
  const sliceLength = Math.max(0, maxLength - 3)
  return `${input.slice(0, sliceLength)}...`
}

/**
 * Strips HTML and XML tags from a string before passing to an AI prompt.
 *
 * @param input - The string containing potential markup.
 * @returns Plain text devoid of HTML/XML tags.
 */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}
