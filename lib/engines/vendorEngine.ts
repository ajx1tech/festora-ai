import type {
  BudgetCategoryId,
  EventProfile,
  EventType,
  Expense,
  Vendor,
} from '@/lib/domain/schemas'

export interface VendorCatalogEntry {
  id: string
  category: BudgetCategoryId
  label: string
  typicalLeadDays: number
  critical: boolean
  budgetCategory: BudgetCategoryId
  questionsToAsk: string[]
}

/**
 * Domain catalog of vendor categories, vetting questions, and scheduling lead times.
 */
export const VENDOR_CATALOG: Record<EventType, VendorCatalogEntry[]> = {
  wedding: [
    {
      id: 'v-wed-venue',
      category: 'venue',
      label: 'Wedding & Reception Venue',
      typicalLeadDays: 240,
      critical: true,
      budgetCategory: 'venue',
      questionsToAsk: [
        'What are the venue curfew timings and noise decibel limits?',
        'Do you permit outside caterers and decorators or only empanelled ones?',
        'Is full generator electrical backup provided during power grid dips?',
        'What is your cancellation and date postponement policy in writing?',
        'Are bridal green rooms, valet parking, and security guards included?',
        'What insurance and alcohol permit requirements apply to this venue?',
      ],
    },
    {
      id: 'v-wed-catering',
      category: 'catering',
      label: 'Catering & Dining Hospitality',
      typicalLeadDays: 180,
      critical: true,
      budgetCategory: 'catering',
      questionsToAsk: [
        'What is your staff-to-guest serving ratio for buffet and table services?',
        'Can you accommodate live counter stations with proper ventilation?',
        'How do you manage cross-contamination for strict dietary and vegan guests?',
        'Is mineral drinking water, ice, and basic glassware included in the rate?',
        'Do you provide an upfront food tasting session before contract signing?',
        'What is your protocol for handling food surplus at the end of the event?',
      ],
    },
    {
      id: 'v-wed-photo',
      category: 'photography',
      label: 'Photographer & Cinematography Crew',
      typicalLeadDays: 200,
      critical: true,
      budgetCategory: 'photography',
      questionsToAsk: [
        'How many primary shooters, assistants, and drone pilots attend on the day?',
        'What is your delivery timeline for teaser clips, full reels, and albums?',
        'Do you retain full copyright or grant unlimited high-resolution print rights?',
        'Have you previously photographed ceremonies at our chosen venue layout?',
        'What dual-slot backup cameras and cloud data storage precautions do you use?',
        'What is the attire and conduct guideline for your on-floor crew?',
      ],
    },
    {
      id: 'v-wed-decor',
      category: 'decor',
      label: 'Mandap, Florals & Stage Designer',
      typicalLeadDays: 140,
      critical: true,
      budgetCategory: 'decor',
      questionsToAsk: [
        'Can you share 3D render mockups of the mandap, stage, and entrance arches?',
        'Are fresh botanical flowers or artificial silks used in heat-exposed areas?',
        'How many setup hours do you need before guest arrival?',
        'Who is responsible for strike-down and venue cleanup after the event?',
        'Do lighting fixtures comply with the venue electrical load limits?',
        'What backup plans are ready in case of unseasonal rain or strong wind?',
      ],
    },
    {
      id: 'v-wed-music',
      category: 'music',
      label: 'DJ, Live Band & Sound Production',
      typicalLeadDays: 120,
      critical: false,
      budgetCategory: 'music',
      questionsToAsk: [
        'Do you supply your own digital sound mixers, amplifiers, and subwoofers?',
        'Can you tailor the playlist to regional traditions and diverse age groups?',
        'Do you coordinate live walk-in audio cues with the master of ceremonies?',
        'What is your overtime hourly billing rate if the celebration extends?',
        'Are wireless microphones provided for speeches, toasts, and vows?',
        'What backup equipment is kept on site in case of amplifier failure?',
      ],
    },
    {
      id: 'v-wed-attire',
      category: 'attire',
      label: 'Bridal & Groom Styling Boutique',
      typicalLeadDays: 100,
      critical: false,
      budgetCategory: 'attire',
      questionsToAsk: [
        'How many fitting sessions are included in the bespoke pricing?',
        'What is the turnaround time for emergency stitch alterations?',
        'Can you provide matching pocket squares, dupattas, or family accents?',
        'What fabric care and packing instructions are recommended for travel?',
        'Do you offer on-site draping or stylist assistance on the wedding morning?',
      ],
    },
    {
      id: 'v-wed-rituals',
      category: 'rituals',
      label: 'Officiant, Priest & Ceremony Materials',
      typicalLeadDays: 60,
      critical: true,
      budgetCategory: 'rituals',
      questionsToAsk: [
        'Are you comfortable conducting ceremonies in English, Hindi, or dual language?',
        'Will you provide a detailed checklist of holy items (samagri) to procure?',
        'What is the expected duration of the primary wedding ritual?',
        'Do you assist with marriage registry documentation and affidavits?',
        'Can custom vows or personalized blessings be incorporated into the flow?',
      ],
    },
    {
      id: 'v-wed-transport',
      category: 'transport',
      label: 'Guest Shuttles & Valet Fleet',
      typicalLeadDays: 45,
      critical: false,
      budgetCategory: 'transport',
      questionsToAsk: [
        'Are all vehicle drivers commercially licensed and background-verified?',
        'What is the staging route between partner hotels and the venue?',
        'Is fuel, highway toll tax, and driver refreshment included in quotes?',
        'How many dedicated valet attendants manage peak guest arrival times?',
        'What communication channel connects the dispatcher with the bridal party?',
      ],
    },
  ],
  birthday: [
    {
      id: 'v-bday-venue',
      category: 'venue',
      label: 'Birthday Party Hall or Lounge',
      typicalLeadDays: 45,
      critical: true,
      budgetCategory: 'venue',
      questionsToAsk: [
        'What is the private hall capacity for standing mingle versus seated dinner?',
        'Do you allow outside birthday cake cutting without supplementary corkage fees?',
        'Can we connect our own phone or iPad to your house sound speakers?',
        'How many hours prior to party kickoff do we have access for decorating?',
        'Is clean-up at the conclusion of the event managed by in-house staff?',
        'What are the parking allowances and child safety provisions on site?',
      ],
    },
    {
      id: 'v-bday-catering',
      category: 'catering',
      label: 'Party Catering & Finger Foods',
      typicalLeadDays: 28,
      critical: true,
      budgetCategory: 'catering',
      questionsToAsk: [
        'Can you serve kid-friendly finger foods alongside adult gourmet options?',
        'Are warming chafing dishes, disposable bamboo plates, and napkins supplied?',
        'What is the minimum head-count guarantee policy?',
        'How do you manage refill timing during peak celebration hours?',
        'Do you supply non-alcoholic punch, mocktails, and water stations?',
      ],
    },
    {
      id: 'v-bday-cake',
      category: 'cake',
      label: 'Custom Fondant & Pastry Baker',
      typicalLeadDays: 30,
      critical: true,
      budgetCategory: 'cake',
      questionsToAsk: [
        'Can you replicate our customized theme and character references accurately?',
        'Do you offer eggless, gluten-free, or nut-safe allergen separation?',
        'Is temperature-controlled refrigerated delivery to the venue guaranteed?',
        'What tier structural supports are used for multi-layer celebration cakes?',
        'Do you provide custom cake toppers, sparkler candles, and serving knives?',
      ],
    },
    {
      id: 'v-bday-entertainer',
      category: 'entertainment',
      label: 'DJ, Magician or Party Entertainer',
      typicalLeadDays: 35,
      critical: false,
      budgetCategory: 'entertainment',
      questionsToAsk: [
        'What age group is your interactive performance tailored towards?',
        'How long is your primary performance slot and intermission structure?',
        'Do you supply your own props, sound amplifiers, and prizes?',
        'Can you incorporate special birthday child trivia into the routine?',
        'What is your cancellation and illness substitute guarantee?',
      ],
    },
    {
      id: 'v-bday-decor',
      category: 'decor',
      label: 'Balloon & Theme Styling Specialist',
      typicalLeadDays: 15,
      critical: false,
      budgetCategory: 'decor',
      questionsToAsk: [
        'Are organic balloon arches biodegradable or latex-safe for indoor use?',
        'Do you provide neon signage, marquis numbers, and photo backdrops?',
        'How much setup time is required before guests arrive?',
        'Do you return after the party to dismantle frames and stands?',
        'Can table centerpieces be converted into take-home favors for guests?',
      ],
    },
    {
      id: 'v-bday-photo',
      category: 'photography',
      label: 'Celebration Photographer or Photobooth',
      typicalLeadDays: 20,
      critical: false,
      budgetCategory: 'photography',
      questionsToAsk: [
        'Does the photobooth provide instant digital text sharing and physical prints?',
        'Can we supply a custom logo or birthday border for print strips?',
        'What fun props, hats, and glasses are provided with the booth?',
        'How quickly after the party will the full digital album be accessible?',
        'Is an attendant on hand throughout the duration to assist guests?',
      ],
    },
  ],
  community: [
    {
      id: 'v-com-venue',
      category: 'venue',
      label: 'Civic Grounds, Stadium or Park',
      typicalLeadDays: 70,
      critical: true,
      budgetCategory: 'venue',
      questionsToAsk: [
        'Are civic loudspeaker permissions and public gathering permits included?',
        'What are the mandatory security, sanitation, and dumpster requirements?',
        'What electrical load and water access points are accessible across the grounds?',
        'What is the protocol for adverse weather evacuations or ground protection?',
        'Who inspects and signs off on temporary stage or tent installations?',
      ],
    },
    {
      id: 'v-com-av',
      category: 'av',
      label: 'Stage Audio, Visual & Generator Crew',
      typicalLeadDays: 40,
      critical: true,
      budgetCategory: 'av',
      questionsToAsk: [
        'Can your PA system provide clear acoustic coverage for the target crowd size?',
        'Do you supply diesel generator backup to prevent sudden power dropouts?',
        'Are heavy outdoor cables protected by ADA-compliant rubber cable ramps?',
        'Will a dedicated sound engineer remain stationed at the mixer throughout?',
        'Do you provide outdoor LED video walls for daylight viewing?',
      ],
    },
    {
      id: 'v-com-food',
      category: 'food',
      label: 'Community Food Stalls & Refreshments',
      typicalLeadDays: 35,
      critical: true,
      budgetCategory: 'food',
      questionsToAsk: [
        'Do all food stall operators possess valid municipal food safety certificates?',
        'How will gray water, cooking grease, and packaging trash be disposed of?',
        'Are multiple hydration and free drinking water stations distributed evenly?',
        'What fire extinguisher and flame prevention standards are enforced at cooking stalls?',
        'Can you accommodate subsidized meal tokens or digital payment systems?',
      ],
    },
    {
      id: 'v-com-safety',
      category: 'safety',
      label: 'First Aid, Security & Paramedic Team',
      typicalLeadDays: 30,
      critical: true,
      budgetCategory: 'safety',
      questionsToAsk: [
        'Will a certified ambulance and paramedic crew remain on standby on site?',
        'How many licensed security marshals will manage crowd flow and perimeter fencing?',
        'What is the clear evacuation path and lost-child reunification protocol?',
        'Do security leads carry two-way radios on isolated channels?',
        'Where will the designated first-aid tent and hydration center be located?',
      ],
    },
    {
      id: 'v-com-decor',
      category: 'decor',
      label: 'Wayfinding, Tents & Crowd Barricades',
      typicalLeadDays: 20,
      critical: false,
      budgetCategory: 'decor',
      questionsToAsk: [
        'Are all tents, canopies, and stage covers certified fire-retardant?',
        'Do you provide high-contrast bilingual wayfinding signage for exits and toilets?',
        'How many heavy-duty barricades are provided for crowd control queues?',
        'What is the anchor system used to prevent tents lifting during high winds?',
        'Will your crew execute rapid tear-down after the final performance?',
      ],
    },
    {
      id: 'v-com-entertainment',
      category: 'entertainment',
      label: 'Community Performers & Host',
      typicalLeadDays: 25,
      critical: false,
      budgetCategory: 'entertainment',
      questionsToAsk: [
        'Can you provide a dynamic bilingual emcee experienced in large crowds?',
        'What sound check and green room hospitality requirements apply?',
        'Are performing group travel and meal arrangements included in pricing?',
        'Do you have backup performer agreements in case of illness?',
        'Can local youth groups or schools participate in opening segment slots?',
      ],
    },
  ],
}

/**
 * Initializes a default checklist of vendors for an event profile.
 *
 * @param profile - Validated event profile.
 * @returns Array of initial Vendor objects set to 'researching' status.
 */
export function buildVendorChecklist(profile: EventProfile): Vendor[] {
  const catalog = VENDOR_CATALOG[profile.type]
  return catalog.map((entry, idx) => ({
    id: `ven-${profile.type}-${idx + 1}-${entry.category}`,
    category: entry.category,
    name: entry.label,
    status: 'researching',
    quote: 0,
    notes: `Recommended booking window: ${entry.typicalLeadDays} days prior.`,
  }))
}

export interface VendorProgress {
  total: number
  bookedOrPaid: number
  percent: number
  criticalUnbooked: number
}

/**
 * Evaluates vendor hiring velocity and readiness metrics.
 *
 * @param vendors - List of tracked vendors.
 * @param eventType - Optional event type to cross-reference criticality from catalog.
 * @returns High-level hiring progress counts and percentages.
 */
export function vendorProgress(
  vendors: Vendor[],
  eventType: EventType = 'wedding'
): VendorProgress {
  const total = vendors.length
  if (total === 0) {
    return { total: 0, bookedOrPaid: 0, percent: 100, criticalUnbooked: 0 }
  }

  const catalog = VENDOR_CATALOG[eventType]
  const criticalCategories = new Set(
    catalog.filter((c) => c.critical).map((c) => c.category)
  )

  const bookedOrPaid = vendors.filter(
    (v) => v.status === 'booked' || v.status === 'paid'
  ).length

  const criticalUnbooked = vendors.filter((v) => {
    const isCritical = criticalCategories.has(v.category as BudgetCategoryId)
    const isPending = v.status !== 'booked' && v.status !== 'paid'
    return isCritical && isPending
  }).length

  const percent = Math.round((bookedOrPaid / total) * 100)

  return {
    total,
    bookedOrPaid,
    percent,
    criticalUnbooked,
  }
}

/**
 * Sums monetary quotes for vendors that have been officially booked or paid.
 *
 * @param vendors - List of vendors.
 * @returns Total committed monetary sum in whole units.
 */
export function committedSpend(vendors: Vendor[]): number {
  return vendors
    .filter((v) => v.status === 'booked' || v.status === 'paid')
    .reduce((sum, v) => sum + Math.max(0, v.quote), 0)
}

/**
 * Links vendor quotes directly into the expense ledger.
 * Updates or creates an expense record for each booked/paid vendor with quote > 0.
 *
 * @param vendors - List of tracked vendors.
 * @param currentExpenses - Existing list of expenses.
 * @returns Synchronized expense array reflecting vendor contracts.
 */
export function syncVendorSpendToExpenses(
  vendors: Vendor[],
  currentExpenses: Expense[]
): Expense[] {
  const result: Expense[] = currentExpenses.map((exp) => ({ ...exp }))
  const bookedVendors = vendors.filter(
    (v) => (v.status === 'booked' || v.status === 'paid') && v.quote > 0
  )

  for (const v of bookedVendors) {
    const expectedId = `exp-vendor-${v.id}`
    const existingIndex = result.findIndex((e) => e.id === expectedId)

    if (existingIndex >= 0) {
      result[existingIndex].amount = v.quote
      result[existingIndex].label = `${v.name} (Contract)`
    } else {
      result.push({
        id: expectedId,
        categoryId: v.category as BudgetCategoryId,
        label: `${v.name} (Contract)`,
        amount: v.quote,
      })
    }
  }

  return result
}
