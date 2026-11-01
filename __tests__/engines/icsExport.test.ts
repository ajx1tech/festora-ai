import { buildICS, escapeIcsText, foldIcsLine } from '@/lib/engines/icsExport'
import {
  createPlanFromProfile,
  createSampleProfiles,
} from '@/lib/engines/sampleData'

describe('icsExport', () => {
  const fixedNow = new Date('2026-06-01T00:00:00Z')

  it('escapes commas, semicolons, backslashes, and newlines', () => {
    const raw = 'Hello; world, how are you? \\ Test\nNew line'
    const escaped = escapeIcsText(raw)
    expect(escaped).toBe('Hello\\; world\\, how are you? \\\\ Test\\nNew line')
  })

  it('folds lines exceeding 75 octets with CRLF and space', () => {
    const longLine =
      'DESCRIPTION:This is an extremely long description designed to verify that the RFC 5545 75-octet limit is strictly honored by folding correctly.'
    const folded = foldIcsLine(longLine)

    expect(folded).toContain('\r\n ')
    const lines = folded.split('\r\n')
    for (const line of lines) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75)
    }
  })

  it('generates compliant RFC 5545 iCalendar payload', () => {
    const samples = createSampleProfiles(fixedNow)
    const plan = createPlanFromProfile(samples.wedding, fixedNow)
    const ics = buildICS(plan)

    // Starts and ends with standard RFC 5545 tags
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//Festora AI//Event Planning Assistant//EN')

    // Contains CRLF line endings
    expect(ics.includes('\r\n')).toBe(true)

    // Contains main celebration event + one VEVENT per task
    const veventMatches = ics.match(/BEGIN:VEVENT/g)
    const expectedEvents = 1 + plan.tasks.length // 1 for event + N for tasks
    expect(veventMatches?.length).toBe(expectedEvents)

    // Includes VALARM for critical tasks
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:-P1D')
  })
})
