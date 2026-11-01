import type { EventPlan, EventProfile } from '@/lib/domain/schemas'
import { buildBudget } from '@/lib/engines/budgetEngine'
import { fallbackIdeas, fallbackRunOfShow } from '@/lib/engines/fallbackContent'
import { buildTimeline } from '@/lib/engines/timelineEngine'
import { buildVendorChecklist } from '@/lib/engines/vendorEngine'
import { generateId } from '@/lib/utils/ids'

/**
 * Calculates a future ISO date string offset from a reference date by a specified number of days.
 *
 * @param now - Reference current Date.
 * @param daysAhead - Days into the future.
 * @returns YYYY-MM-DD formatted date string.
 */
function offsetDaysISO(now: Date, daysAhead: number): string {
  const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Generates three rich sample event profiles with dynamic dates relative to now.
 *
 * @param now - Reference current Date ensuring demo plans never expire.
 * @returns Map of sample profiles for wedding, birthday, and community event types.
 */
export function createSampleProfiles(
  now: Date
): Record<'wedding' | 'birthday' | 'community', EventProfile> {
  return {
    wedding: {
      name: "Ananya & Rohan's Maharashtrian Wedding",
      type: 'wedding',
      dateISO: offsetDaysISO(now, 180),
      guests: 250,
      budgetTotal: 2500000,
      currency: 'INR',
      city: 'Pune',
      venueType: 'hybrid',
      vibes: [
        'Royal Traditional',
        'Warm Family Hospitality',
        'Floral & Festive',
      ],
      dietary: ['Vegetarian', 'Jain Options', 'Maharashtrian Sweets'],
      traditions:
        'Sakhar Puda, Haldi ceremony, traditional Vivah Sanskar with Antarpat and Saptapadi, followed by grand dinner reception.',
      priorities: ['venue', 'catering', 'photography'],
    },
    birthday: {
      name: "Marcus's 30th Milestone Rooftop Soiree",
      type: 'birthday',
      dateISO: offsetDaysISO(now, 45),
      guests: 40,
      budgetTotal: 6000,
      currency: 'USD',
      city: 'San Francisco',
      venueType: 'indoor',
      vibes: ['Speakeasy Chic', 'Craft Cocktails', 'Ambient Indie Beats'],
      dietary: ['Gluten-Free', 'Vegan Options'],
      traditions:
        'Surprise video tribute, custom whiskey barrel cake, and curated vinyl DJ lounge.',
      priorities: ['venue', 'cake', 'entertainment'],
    },
    community: {
      name: 'Swargadhara Diwali Utsav & Community Mela',
      type: 'community',
      dateISO: offsetDaysISO(now, 90),
      guests: 600,
      budgetTotal: 750000,
      currency: 'INR',
      city: 'Mumbai',
      venueType: 'outdoor',
      vibes: [
        'Lively Cultural Heritage',
        'Vibrant Festive Lights',
        'Family Friendly',
      ],
      dietary: ['100% Vegetarian', 'No Onion No Garlic Stalls'],
      traditions:
        'Diyas lighting ceremony, youth folk dance competitions, rangoli exhibition, and free community feast.',
      priorities: ['venue', 'food', 'av'],
    },
  }
}

/**
 * Assembles a complete, self-contained EventPlan by executing all deterministic engines.
 * Zero external AI dependency required for full plan functionality.
 *
 * @param profile - Validated EventProfile.
 * @param now - Reference date for timeline backwards-scheduling.
 * @returns Fully composed EventPlan populated with budget, tasks, vendors, ideas, and run-of-show.
 */
export function createPlanFromProfile(
  profile: EventProfile,
  now: Date
): EventPlan {
  const budget = buildBudget(profile)
  const tasks = buildTimeline(profile, now)
  const vendors = buildVendorChecklist(profile)
  const aiBundle = fallbackIdeas(profile)
  const runOfShow = fallbackRunOfShow(profile)

  return {
    id: generateId('plan'),
    createdAtISO: now.toISOString(),
    schemaVersion: 1,
    profile,
    budget,
    tasks,
    vendors,
    expenses: [],
    aiBundle,
    runOfShow,
  }
}
