import type {
  AiBundle,
  EventPlan,
  EventProfile,
  RunOfShowItem,
  Vendor,
} from '@/lib/domain/schemas'
import { summarize } from '@/lib/engines/budgetEngine'
import {
  daysUntil,
  getOverdue,
  nextActions,
} from '@/lib/engines/timelineEngine'
import { VENDOR_CATALOG, vendorProgress } from '@/lib/engines/vendorEngine'
import { formatMoney } from '@/lib/utils/format'

/**
 * Deterministically generates offline creative ideas and design themes without invoking Gemini.
 * Customizes concept, 3 distinct themes, 8 actionable ideas, and 4 practical saving tips.
 *
 * @param profile - Validated event profile.
 * @returns Complete AiBundle payload populated with deterministic fallback suggestions.
 */
export function fallbackIdeas(profile: EventProfile): AiBundle {
  const primaryVibe = profile.vibes[0] ?? 'Joyful & Elegant'
  const secondaryVibe = profile.vibes[1] ?? 'Warm Hospitality'
  const perGuest = Math.round(profile.budgetTotal / Math.max(1, profile.guests))

  let concept = ''
  let themes: string[] = []
  let ideas: string[] = []
  let savingTips: string[] = []

  if (profile.type === 'wedding') {
    concept = `A ${primaryVibe.toLowerCase()} celebration in ${profile.city} honoring family heritage while prioritizing ${secondaryVibe.toLowerCase()}. Designed for ${profile.guests} cherished guests with seamless transitions and heartfelt hospitality.`
    themes = [
      'Heritage Royal: Warm gold filigree, rich marigold florals, and antique brass lanterns',
      'Contemporary Botanical: Lush olive greenery, soft ivory drapes, and ambient fairy lights',
      'Sundown Terracotta: Earthen clay pots, sunset blush fabrics, and fragrant jasmine garlands',
    ]
    ideas = [
      'Interactive Chai & Filter Coffee Bar welcoming guests upon arrival',
      'Personalized handwritten welcome notes tucked into each table napkin',
      'Acoustic sitar and flute ensemble playing contemporary melody covers during vows',
      'Live dessert counter featuring fresh jalebi, kulfi, or regional sweets',
      'QR-code photo sharing cards placed at banquet tables for instant guest uploads',
      'Disposable retro cameras distributed among cousin tables for candid moments',
      'Bespoke spice blend or artisanal tea tin as eco-friendly guest departure favors',
      'Coordinated sparkler send-off or rose-petal shower as the couple departs',
    ]
    savingTips = [
      'Prioritize seasonal local blooms over imported flowers to save up to 35% on decor',
      'Combine ceremony and reception at the same venue property to eliminate secondary transport fees',
      'Opt for digital RSVP tracking with printed invites reserved for elders only',
      'Schedule bridal shopping during festival trunk shows or directly with heritage weaving clusters',
    ]
  } else if (profile.type === 'birthday') {
    concept = `An energetic, ${primaryVibe.toLowerCase()} gathering celebrating life milestones in ${profile.city}. Focused on high-energy camaraderie, memorable games, and delicious food for ${profile.guests} guests.`
    themes = [
      'Neon Midnight: Vibrant ultraviolet glow, custom LED signage, and metallic accents',
      'Vintage Speakeasy: Muted amber lighting, jazz playlists, and bespoke mocktail stations',
      'Festival Carnival: Festive bunting, popcorn carts, photobooths, and retro arcade games',
    ]
    ideas = [
      'Customized trivia quiz about the guest of honor with small fun prizes',
      'Signature mocktail or punch bowl crafted in the birthday honoree favourite flavors',
      'Polaroid guestbook station where friends snap portraits and write memories',
      'Interactive DIY dessert topping bar with sprinkles, hot fudge, and fresh berries',
      'Surprise video montage compiling greetings from out-of-town loved ones',
      'Curated playlist transition shifting from relaxed lounge to upbeat dance tracks',
      'Customized birthday cake featuring hand-piped personal inside jokes or milestone emblems',
      'Color-coordinated gift bags with personalized treats and souvenir pins',
    ]
    savingTips = [
      'Utilize digital invite platforms with animated video teasers instead of physical print runs',
      'Pre-batch signature drinks rather than funding an open multi-tier liquor bar',
      'Book a private dining room with existing atmospheric lighting to reduce rental decor spend',
      'Order sheet cakes for kitchen portioning alongside a smaller showcase designer cake',
    ]
  } else {
    concept = `A vibrant community gathering in ${profile.city} fostering local bonds and cultural pride. Designed to welcome ${profile.guests} neighbors with clear wayfinding, engaging stages, and safe crowd logistics.`
    themes = [
      'Cultural Mosaic: Rich regional textiles, handcrafted paper lanterns, and folk art stalls',
      'Eco Green Fair: Bamboo staging, zero-waste hydration hubs, and recycled craft banners',
      'Festive Illumination: Solar fairy lights, decorative rangoli entrances, and acoustic stages',
    ]
    ideas = [
      'Community talent showcase featuring local youth groups, acoustic artists, and dance troupes',
      'Zero-waste hydration hubs distributing filtered water in reusable steel glasses',
      'Artisan craft bazaar offering dedicated exhibition tables to neighborhood micro-makers',
      'Interactive collective art canvas where attendees paint handprints and goodwill wishes',
      'Bilingual event wayfinding banners ensuring effortless orientation for seniors and families',
      'Children activity corner featuring face painting, traditional board games, and storytelling',
      'Community gratitude award ceremony spotlighting neighborhood frontline heroes',
      'Closing candle-lighting or drum circle uniting all attendees in celebration',
    ]
    savingTips = [
      'Partner with municipal parks or civic cultural centers that offer subsidized rental rates',
      'Engage local college volunteer clubs for event day management in exchange for community certificates',
      'Source sound and stage equipment through neighborhood civic associations',
      'Invite sponsored food trucks where operators contribute a percentage of sales to offset ground fees',
    ]
  }

  // Adjust tips if per-guest budget is tight
  if (perGuest < 1000) {
    savingTips[0] =
      'Focus decor spending exclusively on one prominent photo backdrop rather than spreading across the room'
  }

  return {
    concept,
    themes,
    ideas,
    savingTips,
    source: 'template',
    model: 'offline-deterministic',
    generatedAtISO: '2026-11-01T00:00:00.000Z',
  }
}

/**
 * Generates an event day run of show schedule.
 *
 * @param profile - Validated event profile.
 * @returns Array of structured day-of-event schedule items.
 */
export function fallbackRunOfShow(profile: EventProfile): RunOfShowItem[] {
  if (profile.type === 'wedding') {
    return [
      {
        time: '08:00 AM',
        title: 'Vendor Load-In & Decor Setup',
        detail:
          'Florist, sound engineer, and stage decorators arrive at venue. Venue coordinator checks electrical feeds.',
      },
      {
        time: '10:30 AM',
        title: 'Bridal Party & Groom Styling',
        detail:
          'Hair, makeup, and attire dressing in bridal suites. Lead photographer captures getting-ready portraits.',
      },
      {
        time: '01:00 PM',
        title: 'Pre-Ceremony Rituals & Family High-Tea',
        detail:
          'Immediate family blessings, welcoming rituals, and light refreshments served to close relatives.',
      },
      {
        time: '03:30 PM',
        title: 'Procession & Guest Welcome',
        detail:
          'Baraat/procession arrival with lively music. Welcome drinks and flower petals distributed to guests.',
      },
      {
        time: '04:30 PM',
        title: 'Primary Wedding Ceremony & Vows',
        detail:
          'Exchange of garlands, solemn vows, holy fire rounds, and officiant blessings.',
      },
      {
        time: '06:30 PM',
        title: 'Sunset Cocktails & Golden Hour Photography',
        detail:
          'Appetizers circulated while couple and family take formal group portraits during sunset.',
      },
      {
        time: '08:00 PM',
        title: 'Grand Reception Dinner & Toasts',
        detail:
          'Couple entrance, champagne toast, speeches by best friends and parents, followed by gourmet dinner feast.',
      },
      {
        time: '10:00 PM',
        title: 'Dance Floor & Festive Send-Off',
        detail:
          'DJ opens dance floor for celebrations. Farewell hampers presented to departing guests.',
      },
    ]
  }

  if (profile.type === 'birthday') {
    return [
      {
        time: '04:00 PM',
        title: 'Host Arrival & Decor Final Checks',
        detail:
          'Set up balloon arch, arrange party favor bags, and position custom celebration cake in refrigerated unit.',
      },
      {
        time: '05:00 PM',
        title: 'Guest Arrival & Welcome Cocktails',
        detail:
          'Upbeat background music, polaroid photo station active, and pass-around finger foods.',
      },
      {
        time: '06:00 PM',
        title: 'Interactive Party Games & Entertainer',
        detail:
          'Curated party trivia, magician or host activities, and friendly group competitions.',
      },
      {
        time: '07:30 PM',
        title: 'Birthday Cake Cutting & Toasts',
        detail:
          'Gather all guests for celebration song, sparkler candles, commemorative photos, and heartfelt toast.',
      },
      {
        time: '08:00 PM',
        title: 'Dinner Buffet Service',
        detail:
          'Main course dinner buffet opens with curated dietary options and dessert pairings.',
      },
      {
        time: '09:30 PM',
        title: 'Open Dance Floor & Favor Distribution',
        detail:
          'Party DJ hits peak dance tracks. Honoree thanks guests and distributes return gift hampers.',
      },
    ]
  }

  // Community Mela / Gathering
  return [
    {
      time: '07:00 AM',
      title: 'Ground Security & Municipal Clearance',
      detail:
        'Safety marshals unlock gates, inspect fire extinguisher stations, and verify paramedic standby.',
    },
    {
      time: '08:30 AM',
      title: 'Volunteer Rota Briefing & Stall Setup',
      detail:
        'Community volunteers collect kits and walkie-talkies. Local artisan stalls and food trucks dock into assigned spaces.',
    },
    {
      time: '10:00 AM',
      title: 'Official Ribbon Cutting & Opening Remarks',
      detail:
        'Community elders and local leaders inaugurate festival grounds. National anthem and welcome address.',
    },
    {
      time: '11:00 AM',
      title: 'Youth Cultural Stage & Folk Performances',
      detail:
        'Performances by neighborhood music groups, school dance troupes, and acoustic storytellers.',
    },
    {
      time: '01:00 PM',
      title: 'Community Lunch Feast & Food Fair',
      detail:
        'Free community dining counters open alongside subsidized artisan food stalls. Hydration stations active.',
    },
    {
      time: '03:30 PM',
      title: 'Interactive Workshops & Sports Competitions',
      detail:
        'Traditional games, pottery demonstrations, and children painting competitions across activity lawns.',
    },
    {
      time: '06:00 PM',
      title: 'Evening Headliner Performance & Awards',
      detail:
        'Prominent cultural group performance, community volunteer honors, and raffle prize announcements.',
    },
    {
      time: '08:30 PM',
      title: 'Festival Wrap, Illumination & Clean-Up',
      detail:
        'Closing song, thank-you address, zero-waste sanitation sweep, and ground handover.',
    },
  ]
}

export interface FallbackInvitation {
  title: string
  body: string
  rsvp: string
  source: 'template'
}

/**
 * Generates an offline multi-language invitation template for weddings, birthdays, and community events.
 * Supports English, Hindi, Marathi, Spanish, and French across formal and warm tones.
 *
 * @param profile - Validated event profile.
 * @param tone - Tone of communication ('formal' | 'warm' | 'festive').
 * @param language - Language code ('en' | 'hi' | 'mr' | 'es' | 'fr').
 * @returns Complete invitation title, body, and RSVP instruction with source: 'template'.
 */
export function fallbackInvitation(
  profile: EventProfile,
  tone: string = 'warm',
  language: string = 'en'
): FallbackInvitation {
  const lang = language.toLowerCase()
  const isFormal = tone.toLowerCase() === 'formal'

  if (lang === 'hi' || lang === 'hindi') {
    if (profile.type === 'wedding') {
      return {
        title: `शुभ विवाह निमंत्रण: ${profile.name}`,
        body: isFormal
          ? `सस्नेह नमस्कार। हमें आपको ${profile.name} के मांगलिक विवाह समारोह में सादर आमंत्रित करते हुए अपार हर्ष हो रहा है। यह पावन उत्सव ${profile.city} में आयोजित होगा। आपकी गरिमामयी उपस्थिति हमारे इस आनंद को द्विगुणित करेगी।`
          : `प्यार भरा नमस्कार! हमारे परिवार के सबसे खास दिन - ${profile.name} के विवाह उत्सव में आप सादर आमंत्रित हैं। ${profile.city} में होने वाले इस उत्सव में आकर वर-वधु को अपना स्नेह और आशीर्वाद प्रदान करें।`,
        rsvp: 'कृपया अपनी उपस्थिति की पुष्टि शीघ्र करें। संपर्क: +91 98000 00000',
        source: 'template',
      }
    }
    if (profile.type === 'birthday') {
      return {
        title: `जन्मदिन का जश्न: ${profile.name}`,
        body: `खुशियों भरा निमंत्रण! ${profile.name} के जन्मदिन की विशेष पार्टी में आप सपरिवार सादर आमंत्रित हैं। स्थान: ${profile.city}। आइए, मिलकर इस शाम को संगीत, खेल और मिठास के साथ यादगार बनाएं!`,
        rsvp: 'कृपया अपनी उपस्थिति अवश्य बताएं। संपर्क: +91 98000 00000',
        source: 'template',
      }
    }
    return {
      title: `सामुदायिक महोत्सव: ${profile.name}`,
      body: `${profile.city} के समस्त नागरिकों का हार्दिक स्वागत है! ${profile.name} के इस भव्य सामुदायिक मेले में सांस्कृतिक प्रस्तुतियां, लजीज व्यंजन और सामाजिक सौहार्द का आनंद लेने अवश्य पधारें।`,
      rsvp: 'प्रवेश निःशुल्क है। अधिक जानकारी हेतु स्वागत कक्ष से संपर्क करें।',
      source: 'template',
    }
  }

  if (lang === 'mr' || lang === 'marathi') {
    if (profile.type === 'wedding') {
      return {
        title: `शुभविवाह निमंत्रण पत्रिका: ${profile.name}`,
        body: isFormal
          ? `॥ श्री गणेशाय नमः ॥ सस्नेह नमस्कार. ${profile.name} यांचा शुभविवाह सोहळा ${profile.city} येथे करण्याचे योजिले आहे. तरी या मंगलप्रसंगी आपण उपस्थित राहून वधू-वरांस शुभाशीर्वाद द्यावेत, ही नम्र विनंती.`
          : `सप्रेम नमस्कार! आपल्या लाडक्या ${profile.name} च्या लग्नसोहळ्याचा आनंद द्विगुणित करण्यासाठी आपण सहकुटुंब उपस्थित राहावे ही आग्रहाची विनंती. ठिकाण: ${profile.city}.`,
        rsvp: 'कृपया आपल्या उपस्थितीची पूर्वकल्पना द्यावी. संपर्क: +91 98000 00000',
        source: 'template',
      }
    }
    if (profile.type === 'birthday') {
      return {
        title: `वाढदिवसाचा आनंदोत्सव: ${profile.name}`,
        body: `सस्नेह निमंत्रण! ${profile.name} यांच्या वाढदिवसानिमित्त एका धमाकेदार पार्टीचे आयोजन ${profile.city} येथे केले आहे. खेळ, गाणी आणि रुचकर भोजनाचा आस्वाद घेण्यासाठी आपण नक्की यावे!`,
        rsvp: 'उपस्थितीची नोंद करण्यासाठी संपर्क साधा: +91 98000 00000',
        source: 'template',
      }
    }
    return {
      title: `भव्य स्नेहमेळावा: ${profile.name}`,
      body: `${profile.city} मधील सर्व नागरिकांचे मनःपूर्वक स्वागत! ${profile.name} या भव्य सामुदायिक उत्सवात विविध कला, संस्कृती व समाजप्रबोधनात्मक कार्यक्रमांचा आनंद घेण्यासाठी सहकुटुंब सहभागी व्हा.`,
      rsvp: 'प्रवेश सर्वांसाठी खुला व विनामूल्य आहे.',
      source: 'template',
    }
  }

  if (lang === 'es' || lang === 'spanish') {
    return {
      title: `Invitación Especial: ${profile.name}`,
      body: `Con gran alegría te invitamos a celebrar ${profile.name} en la ciudad de ${profile.city}. Será un encuentro lleno de felicidad y gratos momentos compartidos junto a nuestros seres queridos.`,
      rsvp: 'Por favor confirma tu asistencia con anticipación. Contacto: +34 900 000 000',
      source: 'template',
    }
  }

  if (lang === 'fr' || lang === 'french') {
    return {
      title: `Invitation d'Honneur: ${profile.name}`,
      body: `Nous avons le grand plaisir de vous convier à la célébration de ${profile.name} à ${profile.city}. Votre présence parmi nous illuminera cette merveilleuse journée de partage et de fête.`,
      rsvp: 'Prière de confirmer votre présence avant la date limite. Contact: +33 1 00 00 00 00',
      source: 'template',
    }
  }

  // Default English (en)
  if (profile.type === 'wedding') {
    return {
      title: `Wedding Celebration: ${profile.name}`,
      body: isFormal
        ? `The pleasure of your company is requested at the wedding celebration of ${profile.name} in ${profile.city}. We look forward to sharing this momentous beginning surrounded by our dearest family and friends.`
        : `We are getting married! Join us for an unforgettable day of love, laughter, and celebration for ${profile.name} in ${profile.city}. We cannot wait to dance, dine, and celebrate with you!`,
      rsvp: 'Kindly RSVP by scanning your personal link or calling +1 (555) 019-2831.',
      source: 'template',
    }
  }

  if (profile.type === 'birthday') {
    return {
      title: `Birthday Bash: ${profile.name}`,
      body: `Get ready to celebrate! You are warmly invited to celebrate ${profile.name} in ${profile.city}. Join us for delicious food, drinks, games, and great music as we ring in another fantastic year.`,
      rsvp: 'Please let us know if you can make it by replying to this message.',
      source: 'template',
    }
  }

  return {
    title: `Community Festival: ${profile.name}`,
    body: `Welcome one and all! The community is coming together for ${profile.name} in ${profile.city}. Enjoy live performances, local food stalls, and family activities honoring our shared heritage.`,
    rsvp: 'Free admission. Register online for expedited gate check-in.',
    source: 'template',
  }
}

export interface FallbackVendorMessage {
  subject: string
  message: string
  source: 'template'
}

/**
 * Drafts an initial vendor outreach inquiry letter citing profile specifics and vetting questions.
 *
 * @param profile - Validated event profile.
 * @param vendor - Target vendor entity.
 * @returns Subject and pre-composed inquiry letter ready to send.
 */
export function fallbackVendorMessage(
  profile: EventProfile,
  vendor: Vendor
): FallbackVendorMessage {
  const catalog = VENDOR_CATALOG[profile.type]
  const entry = catalog.find((c) => c.category === vendor.category)
  const questionsList = entry
    ? entry.questionsToAsk
        .slice(0, 4)
        .map((q) => `• ${q}`)
        .join('\n')
    : '• What is your date availability and full service quote breakdown?'

  const subject = `Inquiry: Services for ${profile.name} on ${profile.dateISO.split('T')[0]} (${profile.city})`
  const message = `Hello ${vendor.name} Team,

I hope this message finds you well.

We are currently planning "${profile.name}", a ${profile.type} celebration scheduled for ${profile.dateISO.split('T')[0]} in ${profile.city}. We are anticipating approximately ${profile.guests} guests and are actively vetting partners for ${vendor.category} services.

We admire your portfolio and would like to confirm your team's availability for our date. In particular, we would appreciate clarity on the following initial questions:

${questionsList}

Could you please share your standard package brochure, contract terms, and an itemized quotation? If available, we would be delighted to schedule a brief 15-minute introductory call this week.

Thank you for your time and guidance.

Warm regards,
Event Planning Team for ${profile.name}`

  return {
    subject,
    message,
    source: 'template',
  }
}

export interface FallbackChatAnswer {
  answer: string
  source: 'template'
}

/**
 * Answers common planning queries deterministically using real data extracted from the EventPlan.
 *
 * @param question - The user's typed question.
 * @param plan - Current live EventPlan state.
 * @returns Deterministic factual answer grounded in computed metrics.
 */
export function fallbackChatAnswer(
  question: string,
  plan: EventPlan
): FallbackChatAnswer {
  const q = question.toLowerCase()
  const now = new Date(plan.createdAtISO)
  const budgetSummary = summarize(
    plan.budget,
    plan.expenses,
    plan.profile.guests
  )

  if (
    q.includes('budget') ||
    q.includes('remaining') ||
    q.includes('spent') ||
    q.includes('cost') ||
    q.includes('money')
  ) {
    const formattedTotal = formatMoney(
      budgetSummary.totalAllocated,
      plan.profile.currency
    )
    const formattedSpent = formatMoney(
      budgetSummary.totalSpent,
      plan.profile.currency
    )
    const formattedRemaining = formatMoney(
      budgetSummary.remaining,
      plan.profile.currency
    )
    const formattedPerGuest = formatMoney(
      budgetSummary.perGuestCost,
      plan.profile.currency
    )

    let answer = `Here is your current financial posture:
• Total Budget: ${formattedTotal}
• Total Committed / Spent: ${formattedSpent}
• Remaining Available Funds: ${formattedRemaining}
• Estimated Cost Per Guest: ${formattedPerGuest} (${plan.profile.guests} guests)`

    if (budgetSummary.overspentCategories.length > 0) {
      answer += `\n\n⚠️ Notice: The following categories currently exceed allocation: ${budgetSummary.overspentCategories.join(
        ', '
      )}.`
    } else {
      answer += `\n\n✅ Your budget is currently classified as "${budgetSummary.status}".`
    }

    return { answer, source: 'template' }
  }

  if (
    q.includes('next') ||
    q.includes('todo') ||
    q.includes('action') ||
    q.includes('priority') ||
    q.includes('what should i do')
  ) {
    const urgent = nextActions(plan.tasks, now, 4)
    if (urgent.length === 0) {
      return {
        answer:
          'All scheduled tasks are currently completed! Review your vendor contracts and day-of run of show to ensure everyone is aligned.',
        source: 'template',
      }
    }

    const items = urgent
      .map(
        (t, idx) =>
          `${idx + 1}. [Due ${t.dueISO}] ${t.title} ${t.critical ? '(CRITICAL)' : ''}`
      )
      .join('\n')

    return {
      answer: `Here are your most urgent upcoming milestones:\n\n${items}\n\nFocus on clearing critical items first to avoid vendor booking bottlenecks.`,
      source: 'template',
    }
  }

  if (
    q.includes('overdue') ||
    q.includes('late') ||
    q.includes('delay') ||
    q.includes('behind')
  ) {
    const overdue = getOverdue(plan.tasks, now)
    if (overdue.length === 0) {
      return {
        answer:
          'Great news! You have zero overdue tasks. Your planning schedule is completely up to date.',
        source: 'template',
      }
    }

    const items = overdue
      .map((t, idx) => `${idx + 1}. ${t.title} (Target was ${t.dueISO})`)
      .join('\n')

    return {
      answer: `Attention required: You have ${overdue.length} overdue task(s):\n\n${items}\n\nPlease mark them complete or reschedule their target dates in the timeline.`,
      source: 'template',
    }
  }

  if (q.includes('vendor') || q.includes('hire') || q.includes('book')) {
    const progress = vendorProgress(plan.vendors, plan.profile.type)
    return {
      answer: `Vendor hiring status for ${plan.profile.name}:
• Progress: ${progress.bookedOrPaid} of ${progress.total} vendors booked (${progress.percent}%)
• Critical vendors still pending: ${progress.criticalUnbooked}

Use the Vendor checklist to download vetted questions for each partner category.`,
      source: 'template',
    }
  }

  // General Summary Fallback
  const daysLeft = daysUntil(plan.profile.dateISO, now)
  return {
    answer: `Festora AI Event Overview for "${plan.profile.name}":
• Date: ${plan.profile.dateISO.split('T')[0]} (${daysLeft} days remaining)
• Location: ${plan.profile.city} (${plan.profile.venueType} venue)
• Guests: ${plan.profile.guests} confirmed
• Budget: ${formatMoney(plan.profile.budgetTotal, plan.profile.currency)} total
• Tasks: ${plan.tasks.filter((t) => t.done).length} of ${plan.tasks.length} finished

Feel free to ask specific questions about your budget, next actions, vendors, or overdue tasks!`,
    source: 'template',
  }
}
