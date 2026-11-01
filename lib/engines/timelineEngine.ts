import type { EventProfile, EventType, Task } from '@/lib/domain/schemas'

export interface TaskTemplate {
  id: string
  title: string
  category: string
  phase: string
  leadDays: number
  critical: boolean
  notes?: string
}

/**
 * Curated task templates per event type covering full planning lifecycle.
 * Wedding: 24 tasks; Birthday: 16 tasks; Community: 18 tasks.
 */
export const TASK_TEMPLATES: Record<EventType, TaskTemplate[]> = {
  wedding: [
    {
      id: 'w-1',
      title: 'Set overall wedding budget and celebration vision',
      category: 'planning',
      phase: 'Early Vision & Core Bookings',
      leadDays: 300,
      critical: true,
      notes:
        'Align with partner and family on key priorities and spending limits.',
    },
    {
      id: 'w-2',
      title: 'Draft preliminary guest list and estimated headcount',
      category: 'guests',
      phase: 'Early Vision & Core Bookings',
      leadDays: 270,
      critical: true,
      notes: 'Group guests into tiers to adjust for venue capacities.',
    },
    {
      id: 'w-3',
      title: 'Tour and book ceremony and reception venues',
      category: 'venue',
      phase: 'Early Vision & Core Bookings',
      leadDays: 240,
      critical: true,
      notes:
        'Confirm curfew hours, alcohol licensing, and catering guidelines.',
    },
    {
      id: 'w-4',
      title: 'Hire wedding planner or day-of coordinator',
      category: 'planning',
      phase: 'Early Vision & Core Bookings',
      leadDays: 220,
      critical: false,
      notes: 'Provide venue contracts and initial vendor requirements.',
    },
    {
      id: 'w-5',
      title: 'Book lead photographer and videography team',
      category: 'photography',
      phase: 'Early Vision & Core Bookings',
      leadDays: 200,
      critical: true,
      notes:
        'Review portfolios for candid ritual shots and drone capabilities.',
    },
    {
      id: 'w-6',
      title: 'Finalize catering menu and beverage service',
      category: 'catering',
      phase: 'Early Vision & Core Bookings',
      leadDays: 180,
      critical: true,
      notes:
        'Schedule tasting session and confirm regional and dietary options.',
    },
    {
      id: 'w-7',
      title: 'Select wedding party and coordinate attire themes',
      category: 'attire',
      phase: 'Vendor Design & Attire',
      leadDays: 160,
      critical: false,
      notes:
        'Share color palettes with bridesmaids, groomsmen, and close family.',
    },
    {
      id: 'w-8',
      title: 'Hire decor designer, florist, and lighting specialist',
      category: 'decor',
      phase: 'Vendor Design & Attire',
      leadDays: 140,
      critical: true,
      notes:
        'Create mood boards for mandap/altar, stage, and table centerpieces.',
    },
    {
      id: 'w-9',
      title: 'Book DJ, sound equipment, and master of ceremonies',
      category: 'music',
      phase: 'Vendor Design & Attire',
      leadDays: 120,
      critical: false,
      notes:
        'Prepare must-play and do-not-play track lists for sangeet/reception.',
    },
    {
      id: 'w-10',
      title: 'Design invitations, digital cards, and event website',
      category: 'invitations',
      phase: 'Vendor Design & Attire',
      leadDays: 110,
      critical: false,
      notes: 'Include clear RSVP deadlines, map directions, and dress codes.',
    },
    {
      id: 'w-11',
      title: 'Book bridal makeup, mehndi, and grooming artists',
      category: 'attire',
      phase: 'Vendor Design & Attire',
      leadDays: 100,
      critical: false,
      notes: 'Schedule hair and makeup trials for bride and mothers.',
    },
    {
      id: 'w-12',
      title: 'Order wedding attire, fittings, and festive jewelry',
      category: 'attire',
      phase: 'Vendor Design & Attire',
      leadDays: 90,
      critical: true,
      notes: 'Allow 6-8 weeks for alterations and custom embroidery.',
    },
    {
      id: 'w-13',
      title: 'Dispatch formal invitations and launch RSVP portal',
      category: 'invitations',
      phase: 'Guest Outreach & Details',
      leadDays: 75,
      critical: true,
      notes: 'Track delivery of physical cards and digital message delivery.',
    },
    {
      id: 'w-14',
      title: 'Finalize officiant, priests, and ceremonial script',
      category: 'rituals',
      phase: 'Guest Outreach & Details',
      leadDays: 60,
      critical: true,
      notes: 'Confirm holy items (samagri), auspicious timings, and vows.',
    },
    {
      id: 'w-15',
      title: 'Reserve hotel room blocks for out-of-town guests',
      category: 'transport',
      phase: 'Guest Outreach & Details',
      leadDays: 55,
      critical: false,
      notes: 'Negotiate group discounts and airport shuttle options.',
    },
    {
      id: 'w-16',
      title: 'Arrange guest transportation, buses, and valet service',
      category: 'transport',
      phase: 'Guest Outreach & Details',
      leadDays: 45,
      critical: false,
      notes: 'Schedule timing between hotel, ceremony, and reception venues.',
    },
    {
      id: 'w-17',
      title: 'Order guest favors, welcome hampers, and sweets',
      category: 'rituals',
      phase: 'Guest Outreach & Details',
      leadDays: 40,
      critical: false,
      notes: 'Include local treats and custom welcome notes.',
    },
    {
      id: 'w-18',
      title: 'Consolidate RSVPs and communicate dietary needs to caterer',
      category: 'catering',
      phase: 'Guest Outreach & Details',
      leadDays: 30,
      critical: true,
      notes: 'Follow up personally with guests who have not responded.',
    },
    {
      id: 'w-19',
      title: 'Design seating arrangement and print table placecards',
      category: 'guests',
      phase: 'Final Preparations & Run of Show',
      leadDays: 21,
      critical: false,
      notes: 'Coordinate layout with caterer for smooth plate service.',
    },
    {
      id: 'w-20',
      title: 'Confirm final headcount and settlement schedule with venue',
      category: 'venue',
      phase: 'Final Preparations & Run of Show',
      leadDays: 14,
      critical: true,
      notes: 'Lock in final plate count and review safety rules.',
    },
    {
      id: 'w-21',
      title: 'Conduct final garment fitting and steam attire',
      category: 'attire',
      phase: 'Final Preparations & Run of Show',
      leadDays: 10,
      critical: false,
      notes: 'Check comfort of footwear and backup accessories.',
    },
    {
      id: 'w-22',
      title: 'Perform on-site walkthrough with venue coordinator',
      category: 'venue',
      phase: 'Final Preparations & Run of Show',
      leadDays: 7,
      critical: false,
      notes: 'Review vendor load-in doors, power outlets, and green rooms.',
    },
    {
      id: 'w-23',
      title: 'Distribute minute-by-minute run of show to key partners',
      category: 'planning',
      phase: 'Final Preparations & Run of Show',
      leadDays: 3,
      critical: true,
      notes: 'Share contact sheet with planner, MC, photographer, and driver.',
    },
    {
      id: 'w-24',
      title: 'Pack bridal emergency kit, ceremony items, and rings',
      category: 'rituals',
      phase: 'Final Preparations & Run of Show',
      leadDays: 1,
      critical: true,
      notes: 'Safety pins, touch-up kit, marriage certificates, and cash tips.',
    },
  ],
  birthday: [
    {
      id: 'b-1',
      title: 'Decide party theme, guest scope, and overall budget',
      category: 'planning',
      phase: 'Concept & Venue',
      leadDays: 60,
      critical: true,
      notes:
        'Choose between dinner party, interactive lounge, or activity day.',
    },
    {
      id: 'b-2',
      title: 'Draft guest list and gather contact numbers',
      category: 'guests',
      phase: 'Concept & Venue',
      leadDays: 50,
      critical: false,
      notes: 'Estimate kids and adults count for venue sizing.',
    },
    {
      id: 'b-3',
      title: 'Book birthday party venue or private dining hall',
      category: 'venue',
      phase: 'Concept & Venue',
      leadDays: 45,
      critical: true,
      notes: 'Check sound restrictions and outside dessert policies.',
    },
    {
      id: 'b-4',
      title: 'Hire DJ, entertainer, magician, or live performer',
      category: 'entertainment',
      phase: 'Entertainment & Catering',
      leadDays: 35,
      critical: false,
      notes: 'Agree on performance duration and equipment requirements.',
    },
    {
      id: 'b-5',
      title: 'Order custom birthday cake and specialty treats',
      category: 'cake',
      phase: 'Entertainment & Catering',
      leadDays: 30,
      critical: true,
      notes: 'Provide reference theme images and specify dietary requirements.',
    },
    {
      id: 'b-6',
      title: 'Finalize party menu, finger foods, and beverage bar',
      category: 'catering',
      phase: 'Entertainment & Catering',
      leadDays: 28,
      critical: true,
      notes: 'Include crowd favorites and non-alcoholic options.',
    },
    {
      id: 'b-7',
      title: 'Send digital party invitations with RSVP link',
      category: 'invitations',
      phase: 'Entertainment & Catering',
      leadDays: 25,
      critical: true,
      notes: 'Set RSVP date two weeks prior to the event.',
    },
    {
      id: 'b-8',
      title: 'Book event photographer or photobooth rental',
      category: 'photography',
      phase: 'Entertainment & Catering',
      leadDays: 20,
      critical: false,
      notes: 'Request custom digital photo strip frames matching the theme.',
    },
    {
      id: 'b-9',
      title: 'Order balloons, banners, themed tableware, and props',
      category: 'decor',
      phase: 'Decor & Activities',
      leadDays: 15,
      critical: false,
      notes: 'Check backdrop frame measurements with venue manager.',
    },
    {
      id: 'b-10',
      title: 'Plan party game list and build celebration music playlist',
      category: 'entertainment',
      phase: 'Decor & Activities',
      leadDays: 12,
      critical: false,
      notes: 'Prepare prizes for quiz and trivia winners.',
    },
    {
      id: 'b-11',
      title: 'Assemble party favors and return gift bags',
      category: 'invitations',
      phase: 'Decor & Activities',
      leadDays: 10,
      critical: false,
      notes: 'Personalize bags with guest names or theme stickers.',
    },
    {
      id: 'b-12',
      title: 'Follow up on remaining guest RSVPs',
      category: 'guests',
      phase: 'Decor & Activities',
      leadDays: 7,
      critical: true,
      notes: 'Lock down expected headcounts for food preparation.',
    },
    {
      id: 'b-13',
      title: 'Confirm final headcount with caterer and venue',
      category: 'catering',
      phase: 'Final Countdown',
      leadDays: 4,
      critical: true,
      notes: 'Reconfirm delivery arrival windows.',
    },
    {
      id: 'b-14',
      title: 'Confirm cake delivery timing or schedule pickup',
      category: 'cake',
      phase: 'Final Countdown',
      leadDays: 2,
      critical: false,
      notes: 'Ensure venue refrigerator space is reserved.',
    },
    {
      id: 'b-15',
      title: 'Set up party decorations and test sound system',
      category: 'decor',
      phase: 'Final Countdown',
      leadDays: 1,
      critical: false,
      notes: 'Inflate balloon arches and test microphone batteries.',
    },
    {
      id: 'b-16',
      title: 'Welcome guests, kick off activities, and celebrate',
      category: 'planning',
      phase: 'Final Countdown',
      leadDays: 0,
      critical: true,
      notes: 'Enjoy the celebration and take group photos.',
    },
  ],
  community: [
    {
      id: 'c-1',
      title: 'Form organizing committee and establish event charter',
      category: 'volunteers',
      phase: 'Approvals & Foundations',
      leadDays: 90,
      critical: true,
      notes: 'Assign sub-leads for safety, vendors, programming, and media.',
    },
    {
      id: 'c-2',
      title: 'Submit municipal permit applications and police clearances',
      category: 'venue',
      phase: 'Approvals & Foundations',
      leadDays: 80,
      critical: true,
      notes:
        'Include sound loudspeaker permits, fire safety, and street closures.',
    },
    {
      id: 'c-3',
      title: 'Secure community grounds, park, or civic auditorium',
      category: 'venue',
      phase: 'Approvals & Foundations',
      leadDays: 70,
      critical: true,
      notes:
        'Inspect water accessibility, power backup, and restroom capacity.',
    },
    {
      id: 'c-4',
      title: 'Formulate emergency management, safety, and first-aid plan',
      category: 'safety',
      phase: 'Approvals & Foundations',
      leadDays: 60,
      critical: true,
      notes:
        'Mark assembly areas and coordinate with local ambulance services.',
    },
    {
      id: 'c-5',
      title: 'Launch community sponsorship, stall bookings, and donation drive',
      category: 'promotion',
      phase: 'Logistics & Outreach',
      leadDays: 50,
      critical: false,
      notes: 'Provide tiers for local business banners and community partners.',
    },
    {
      id: 'c-6',
      title: 'Recruit community volunteers and schedule briefing sessions',
      category: 'volunteers',
      phase: 'Logistics & Outreach',
      leadDays: 45,
      critical: true,
      notes: 'Create roles for parking, registration, stage, and clean-up.',
    },
    {
      id: 'c-7',
      title: 'Contract stage setup, acoustic PA system, and generator power',
      category: 'av',
      phase: 'Logistics & Outreach',
      leadDays: 40,
      critical: true,
      notes: 'Conduct power load assessment for stalls and stage lighting.',
    },
    {
      id: 'c-8',
      title: 'Coordinate food trucks, refreshment stalls, and drinking water',
      category: 'food',
      phase: 'Logistics & Outreach',
      leadDays: 35,
      critical: false,
      notes: 'Verify food hygiene licenses and waste disposal bins.',
    },
    {
      id: 'c-9',
      title: 'Publish community posters, flyers, and social media campaign',
      category: 'promotion',
      phase: 'Logistics & Outreach',
      leadDays: 30,
      critical: false,
      notes:
        'Distribute notices across local housing societies and digital groups.',
    },
    {
      id: 'c-10',
      title: 'Finalize cultural acts, guest speakers, and stage lineup',
      category: 'entertainment',
      phase: 'Operations & Production',
      leadDays: 25,
      critical: false,
      notes: 'Collect track audio and introduction bios from performers.',
    },
    {
      id: 'c-11',
      title: 'Order wayfinding signage, waste bins, and safety barricades',
      category: 'decor',
      phase: 'Operations & Production',
      leadDays: 20,
      critical: false,
      notes:
        'Clearly mark first-aid tents, lost-and-found, and emergency exits.',
    },
    {
      id: 'c-12',
      title: 'Establish volunteer rota, shift schedules, and walkie talkies',
      category: 'volunteers',
      phase: 'Operations & Production',
      leadDays: 15,
      critical: true,
      notes: 'Equip each shift lead with emergency escalation numbers.',
    },
    {
      id: 'c-13',
      title: 'Inspect first-aid booths and verify medical volunteer attendance',
      category: 'safety',
      phase: 'Operations & Production',
      leadDays: 12,
      critical: true,
      notes:
        'Stock ice packs, band-aids, AED if available, and hydration fluids.',
    },
    {
      id: 'c-14',
      title: 'Distribute vendor arrival windows and stall allocation maps',
      category: 'planning',
      phase: 'Operations & Production',
      leadDays: 10,
      critical: false,
      notes: 'Prevent vehicle bottlenecks during morning setup hours.',
    },
    {
      id: 'c-15',
      title: 'Reconfirm police liaison and paramedic presence',
      category: 'safety',
      phase: 'Execution Week',
      leadDays: 7,
      critical: true,
      notes: 'Provide updated expected footfall numbers to municipal desk.',
    },
    {
      id: 'c-16',
      title: 'Conduct dry run with volunteer leads and technical crew',
      category: 'volunteers',
      phase: 'Execution Week',
      leadDays: 3,
      critical: false,
      notes: 'Test walkie-talkie channels and audio mic handoffs.',
    },
    {
      id: 'c-17',
      title: 'Stage assembly, audio level check, and electrical audit',
      category: 'av',
      phase: 'Execution Week',
      leadDays: 1,
      critical: true,
      notes: 'Secure cables under rubber mats to prevent tripping hazards.',
    },
    {
      id: 'c-18',
      title: 'Day-of event execution, crowd management, and closing wrap',
      category: 'planning',
      phase: 'Execution Week',
      leadDays: 0,
      critical: true,
      notes: 'Coordinate teardown and ensure grounds are returned spotless.',
    },
  ],
}

/**
 * Calculates calendar days remaining between a target ISO date and a reference date.
 *
 * @param dateISO - Target date string in YYYY-MM-DD or ISO format.
 * @param now - Reference current Date.
 * @returns Signed integer count of calendar days.
 */
export function daysUntil(dateISO: string, now: Date): number {
  const target = new Date(dateISO.split('T')[0] + 'T00:00:00Z')
  const base = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z')
  const diffMs = target.getTime() - base.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 *
 * @param d - Target date object.
 * @returns Date string formatted as YYYY-MM-DD.
 */
function toDateString(d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Builds an actionable timeline of tasks tailored to the event profile and date.
 * Automatically switches to COMPRESSED MODE if the planning runway is shorter than
 * the longest template lead time, mapping tasks proportionally into [today+1, eventDate-1].
 *
 * @param profile - Validated event profile.
 * @param now - Current reference date for calculation.
 * @returns Sorted array of Task items with guaranteed ascending dates prior to event date.
 */
export function buildTimeline(profile: EventProfile, now: Date): Task[] {
  const templates = TASK_TEMPLATES[profile.type]
  const eventDateStr = profile.dateISO.split('T')[0]
  const eventDate = new Date(`${eventDateStr}T00:00:00Z`)
  const baseDate = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z')

  const availableDays = Math.max(
    0,
    Math.round(
      (eventDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  )

  const maxLeadDays = Math.max(...templates.map((t) => t.leadDays))
  const isCompressed = availableDays < maxLeadDays

  // Stable sort of templates descending by leadDays to establish natural ordering
  const sortedTemplates = [...templates].sort((a, b) => b.leadDays - a.leadDays)

  const tasks: Task[] = sortedTemplates.map((template, idx) => {
    let taskDate: Date

    if (isCompressed) {
      if (availableDays <= 1) {
        taskDate = new Date(baseDate.getTime())
      } else {
        // Proportionally distribute between day 1 and day (availableDays - 1)
        const leadRatio =
          maxLeadDays > 0 ? (maxLeadDays - template.leadDays) / maxLeadDays : 0
        const span = availableDays - 1
        const offset = Math.min(
          span,
          Math.max(1, Math.round(1 + leadRatio * (span - 1)))
        )
        taskDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000)
      }
    } else {
      // Normal backwards scheduling: eventDate minus leadDays
      const dueMs =
        eventDate.getTime() - template.leadDays * 24 * 60 * 60 * 1000
      taskDate = new Date(dueMs)

      // Guarantee no task is scheduled earlier than today if it would be in the past
      if (taskDate.getTime() < baseDate.getTime()) {
        taskDate = new Date(baseDate.getTime())
      }
    }

    // Strict guarantee: never date a task after the event date
    if (taskDate.getTime() > eventDate.getTime()) {
      taskDate = new Date(eventDate.getTime())
    }

    return {
      id: `task-${profile.type}-${idx + 1}-${template.id}`,
      title: template.title,
      category: template.category,
      dueISO: toDateString(taskDate),
      phase: template.phase,
      critical: isCompressed ? true : template.critical,
      done: false,
      source: 'template',
      notes: template.notes ?? '',
      compressed: isCompressed,
    }
  })

  // Sort ascending by due date; maintain template phase order as tie breaker
  return tasks.sort((a, b) => {
    if (a.dueISO !== b.dueISO) {
      return a.dueISO.localeCompare(b.dueISO)
    }
    return a.id.localeCompare(b.id)
  })
}

/**
 * Returns tasks that are past due relative to reference date and still pending.
 *
 * @param tasks - List of timeline tasks.
 * @param now - Reference date.
 * @returns Array of overdue pending tasks.
 */
export function getOverdue(tasks: Task[], now: Date): Task[] {
  const todayStr = toDateString(now)
  return tasks.filter((t) => !t.done && t.dueISO < todayStr)
}

/**
 * Organizes tasks by their planning phase.
 *
 * @param tasks - List of timeline tasks.
 * @returns Record mapping phase name to task list.
 */
export function groupByPhase(tasks: Task[]): Record<string, Task[]> {
  const result: Record<string, Task[]> = {}
  for (const t of tasks) {
    if (!result[t.phase]) {
      result[t.phase] = []
    }
    result[t.phase].push(t)
  }
  return result
}

export interface CompletionStats {
  total: number
  completed: number
  percent: number
  criticalPending: number
}

/**
 * Computes high-level progress statistics across tasks.
 *
 * @param tasks - List of timeline tasks.
 * @returns Summary of total, completed, completion percent, and critical pending counts.
 */
export function completionStats(tasks: Task[]): CompletionStats {
  const total = tasks.length
  if (total === 0) {
    return { total: 0, completed: 0, percent: 100, criticalPending: 0 }
  }

  const completed = tasks.filter((t) => t.done).length
  const criticalPending = tasks.filter((t) => !t.done && t.critical).length
  const percent = Math.round((completed / total) * 100)

  return {
    total,
    completed,
    percent,
    criticalPending,
  }
}

/**
 * Recommends the next n most urgent actions, prioritizing overdue and critical items.
 *
 * @param tasks - List of timeline tasks.
 * @param now - Current reference date.
 * @param n - Maximum count of recommendations to return (default 5).
 * @returns Next actionable tasks in order of urgency.
 */
export function nextActions(tasks: Task[], now: Date, n: number = 5): Task[] {
  const pending = tasks.filter((t) => !t.done)
  const todayStr = toDateString(now)

  return pending
    .sort((a, b) => {
      const aOverdue = a.dueISO < todayStr
      const bOverdue = b.dueISO < todayStr

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      if (a.critical && !b.critical) return -1
      if (!a.critical && b.critical) return 1

      return a.dueISO.localeCompare(b.dueISO)
    })
    .slice(0, n)
}
