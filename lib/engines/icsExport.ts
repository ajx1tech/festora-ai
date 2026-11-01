import type { EventPlan } from '@/lib/domain/schemas'

/**
 * Escapes special characters for iCalendar text fields in accordance with RFC 5545.
 *
 * @param text - Raw input string.
 * @returns Escaped text string with backslashes, semicolons, commas, and newlines escaped.
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Folds a single iCalendar content line to ensure it does not exceed 75 octets (RFC 5545 Section 3.1).
 *
 * @param line - The unfolded header or property line.
 * @returns CRLF and space folded string representation.
 */
export function foldIcsLine(line: string): string {
  const maxBytes = 75
  if (Buffer.byteLength(line, 'utf8') <= maxBytes) {
    return line
  }

  const parts: string[] = []
  let current = ''

  for (const char of line) {
    const candidate = current + char
    const candidateBytes = Buffer.byteLength(candidate, 'utf8')
    const limit = parts.length === 0 ? maxBytes : maxBytes - 1

    if (candidateBytes > limit && current.length > 0) {
      parts.push(current)
      current = char
    } else {
      current = candidate
    }
  }

  if (current.length > 0) {
    parts.push(current)
  }

  return parts.join('\r\n ')
}

/**
 * Formats a YYYY-MM-DD string into iCalendar DATE format YYYYMMDD.
 *
 * @param dateStr - Date string formatted as YYYY-MM-DD.
 * @returns Compact date format YYYYMMDD.
 */
function toIcsDate(dateStr: string): string {
  return dateStr.split('T')[0].replace(/-/g, '')
}

/**
 * Calculates the day after a given date formatted as YYYYMMDD (exclusive DTEND).
 *
 * @param dateStr - Base date string.
 * @returns Following day string formatted as YYYYMMDD.
 */
function toNextIcsDate(dateStr: string): string {
  const d = new Date(`${dateStr.split('T')[0]}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/**
 * Converts an ISO string into an iCalendar UTC timestamp YYYYMMDDTHHMMSSZ.
 *
 * @param isoStr - ISO timestamp string.
 * @returns Formatted UTC stamp string.
 */
function toIcsStamp(isoStr: string): string {
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) {
    return '20261101T000000Z'
  }
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${day}T${hh}${mm}${ss}Z`
}

/**
 * Generates an RFC 5545 compliant iCalendar string containing tasks and the milestone event.
 * Incorporates 75-octet line folding, escaped text, all-day VEVENT blocks, and VALARM for critical tasks.
 *
 * @param plan - Validated EventPlan containing tasks and profile metadata.
 * @returns Complete RFC 5545 formatted .ics file text with CRLF line endings.
 */
export function buildICS(plan: EventPlan): string {
  const dtStamp = toIcsStamp(plan.createdAtISO)
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Festora AI//Event Planning Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(plan.profile.name)}`,
  ]

  // 1. Main Celebration Milestone Event
  const eventDateStr = plan.profile.dateISO.split('T')[0]
  const eventStart = toIcsDate(eventDateStr)
  const eventEnd = toNextIcsDate(eventDateStr)

  const eventLines: string[] = [
    'BEGIN:VEVENT',
    `UID:festora-event-${plan.id}@festora.ai`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${eventStart}`,
    `DTEND;VALUE=DATE:${eventEnd}`,
    `SUMMARY:🎉 ${escapeIcsText(plan.profile.name)}`,
    `DESCRIPTION:${escapeIcsText(
      `${plan.profile.name} celebration in ${plan.profile.city} with ${plan.profile.guests} guests. Created with Festora AI.`
    )}`,
    `LOCATION:${escapeIcsText(plan.profile.city)}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ]
  lines.push(...eventLines)

  // 2. Individual Tasks as All-Day Events
  for (const task of plan.tasks) {
    const taskStart = toIcsDate(task.dueISO)
    const taskEnd = toNextIcsDate(task.dueISO)
    const summaryPrefix = task.critical ? '[CRITICAL] ' : ''
    const fullSummary = `${summaryPrefix}${task.title}`

    const taskLines: string[] = [
      'BEGIN:VEVENT',
      `UID:festora-${task.id}@festora.ai`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${taskStart}`,
      `DTEND;VALUE=DATE:${taskEnd}`,
      `SUMMARY:${escapeIcsText(fullSummary)}`,
      `DESCRIPTION:${escapeIcsText(
        `Category: ${task.category}\nPhase: ${task.phase}\nNotes: ${task.notes}`
      )}`,
      `STATUS:${task.done ? 'COMPLETED' : 'CONFIRMED'}`,
      'TRANSP:TRANSPARENT',
    ]

    // VALARM 1 day prior for critical tasks
    if (task.critical) {
      taskLines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${escapeIcsText(task.title)} is due tomorrow!`,
        'TRIGGER:-P1D',
        'END:VALARM'
      )
    }

    taskLines.push('END:VEVENT')
    lines.push(...taskLines)
  }

  lines.push('END:VCALENDAR')

  // Apply 75-octet line folding and CRLF endings
  const folded = lines.map((l) => foldIcsLine(l)).join('\r\n')
  return `${folded}\r\n`
}
