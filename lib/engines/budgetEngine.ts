import type {
  BudgetCategoryId,
  BudgetLine,
  EventProfile,
  EventType,
  Expense,
} from '@/lib/domain/schemas'

export interface AllocationTemplateItem {
  id: BudgetCategoryId
  label: string
  percent: number
}

/**
 * Baseline allocation templates per event type.
 * Every template sums to exactly 100% and incorporates an 8-10% contingency reserve.
 */
export const ALLOCATION_TEMPLATES: Record<EventType, AllocationTemplateItem[]> =
  {
    wedding: [
      { id: 'venue', label: 'Venue & Spaces', percent: 22 },
      { id: 'catering', label: 'Catering & Beverages', percent: 25 },
      { id: 'decor', label: 'Decor, Florals & Lighting', percent: 14 },
      { id: 'photography', label: 'Photography & Videography', percent: 10 },
      { id: 'attire', label: 'Attire & Styling', percent: 8 },
      { id: 'music', label: 'Music, Sound & DJ', percent: 5 },
      { id: 'invitations', label: 'Invitations & Stationery', percent: 3 },
      { id: 'transport', label: 'Guest Transport & Valet', percent: 3 },
      { id: 'rituals', label: 'Rituals, Priests & Favors', percent: 2 },
      { id: 'contingency', label: 'Contingency Buffer', percent: 8 },
    ],
    birthday: [
      { id: 'venue', label: 'Venue Hire', percent: 20 },
      { id: 'catering', label: 'Food & Refreshments', percent: 28 },
      { id: 'cake', label: 'Signature Cake & Desserts', percent: 7 },
      { id: 'decor', label: 'Themed Decor & Balloons', percent: 15 },
      { id: 'entertainment', label: 'Games & Entertainment', percent: 10 },
      { id: 'invitations', label: 'Invitations & Favors', percent: 4 },
      { id: 'photography', label: 'Photographer', percent: 8 },
      { id: 'contingency', label: 'Contingency Buffer', percent: 8 },
    ],
    community: [
      { id: 'venue', label: 'Venue & Municipal Permits', percent: 18 },
      { id: 'food', label: 'Community Feast & Refreshments', percent: 24 },
      { id: 'av', label: 'Stage, AV & Acoustic System', percent: 14 },
      { id: 'decor', label: 'Signage, Stalls & Decor', percent: 10 },
      {
        id: 'entertainment',
        label: 'Performances & Cultural Acts',
        percent: 10,
      },
      { id: 'volunteers', label: 'Volunteers, Kits & Logistics', percent: 8 },
      { id: 'promotion', label: 'Flyers, Socials & Outreach', percent: 4 },
      { id: 'safety', label: 'Safety, First Aid & Sanitation', percent: 4 },
      { id: 'contingency', label: 'Contingency Buffer', percent: 8 },
    ],
  }

/**
 * Distributes integer amounts across categories using the Largest-Remainder Method (Hare-Niemeyer).
 * Guarantees that the sum of allocated integers equals the target total exactly.
 *
 * @param items - Items containing id, label, and normalized percentage (summing to 100).
 * @param totalAmount - Total monetary sum to apportion.
 * @returns Array of BudgetLines with exact integer allocations.
 */
function distributeWithLargestRemainder(
  items: { id: BudgetCategoryId; label: string; percent: number }[],
  totalAmount: number
): BudgetLine[] {
  if (items.length === 0) {
    return []
  }

  const rawAllocations = items.map((item, index) => {
    const raw = (item.percent / 100) * totalAmount
    const floor = Math.floor(raw)
    const remainder = raw - floor
    return {
      id: item.id,
      label: item.label,
      percent: item.percent,
      floor,
      remainder,
      originalIndex: index,
    }
  })

  const sumFloor = rawAllocations.reduce((acc, curr) => acc + curr.floor, 0)
  let shortfall = Math.round(totalAmount - sumFloor)

  // Sort by highest fractional remainder first; break ties by original template order
  const sorted = [...rawAllocations].sort((a, b) => {
    if (b.remainder !== a.remainder) {
      return b.remainder - a.remainder
    }
    return a.originalIndex - b.originalIndex
  })

  const additions = new Map<number, number>()
  for (let i = 0; i < sorted.length && shortfall > 0; i += 1) {
    additions.set(sorted[i].originalIndex, 1)
    shortfall -= 1
  }

  return rawAllocations.map((item, idx) => ({
    id: item.id,
    label: item.label,
    percent: Number(item.percent.toFixed(2)),
    allocated: item.floor + (additions.get(idx) ?? 0),
    spent: 0,
    locked: false,
  }))
}

/**
 * Builds a deterministic budget allocation based on user profile and preferences.
 * Applies priority boosts and guest adjustments, then apportions money with zero remainder.
 *
 * @param profile - Validated event profile containing budget total, event type, and priorities.
 * @returns List of BudgetLines with exact allocations summing to budgetTotal.
 */
export function buildBudget(profile: EventProfile): BudgetLine[] {
  const template = ALLOCATION_TEMPLATES[profile.type]
  const workingPercents = template.map((item) => ({ ...item }))

  // 1. Priority Boosts: +3% to prioritized categories, funded proportionally from non-priority non-contingency
  const validPriorities = profile.priorities.filter((p) =>
    workingPercents.some((w) => w.id === p && p !== 'contingency')
  )

  if (validPriorities.length > 0) {
    const boostPerPriority = 3
    const totalBoost = validPriorities.length * boostPerPriority

    const nonPriorityNonContingency = workingPercents.filter(
      (w) => !validPriorities.includes(w.id) && w.id !== 'contingency'
    )

    const poolPercent = nonPriorityNonContingency.reduce(
      (sum, item) => sum + item.percent,
      0
    )

    if (poolPercent > totalBoost) {
      for (const item of workingPercents) {
        if (validPriorities.includes(item.id)) {
          item.percent += boostPerPriority
        } else if (item.id !== 'contingency') {
          const reduction = (item.percent / poolPercent) * totalBoost
          item.percent = Math.max(1, item.percent - reduction)
        }
      }
    }
  }

  // 2. Guest-Scale Adjustment: High guest counts emphasize catering/food
  if (profile.guests > 250) {
    const foodItem = workingPercents.find(
      (item) => item.id === 'catering' || item.id === 'food'
    )
    const flexibleLines = workingPercents.filter(
      (item) =>
        item.id !== 'catering' &&
        item.id !== 'food' &&
        item.id !== 'contingency' &&
        !validPriorities.includes(item.id)
    )

    if (foodItem && flexibleLines.length > 0) {
      const guestBoost = 2
      const pool = flexibleLines.reduce((s, it) => s + it.percent, 0)
      if (pool > guestBoost) {
        foodItem.percent += guestBoost
        for (const item of flexibleLines) {
          const reduction = (item.percent / pool) * guestBoost
          item.percent = Math.max(1, item.percent - reduction)
        }
      }
    }
  }

  // 3. Normalize percentages so the sum is precisely 100
  const currentTotal = workingPercents.reduce((sum, it) => sum + it.percent, 0)
  for (const item of workingPercents) {
    item.percent = (item.percent / currentTotal) * 100
  }

  return distributeWithLargestRemainder(workingPercents, profile.budgetTotal)
}

/**
 * Rebalances unlocked budget lines when a single line's allocation is manually updated.
 * Preserves the exact total budget and respects locked lines.
 *
 * @param lines - Existing budget line items.
 * @param editedId - The Category ID of the line being edited.
 * @param newAmount - The new allocation amount requested for the edited line.
 * @returns A fresh array of BudgetLines with the delta redistributed across unlocked items.
 */
export function rebalance(
  lines: BudgetLine[],
  editedId: string,
  newAmount: number
): BudgetLine[] {
  const targetIndex = lines.findIndex((l) => l.id === editedId)
  if (targetIndex === -1) {
    return lines
  }

  const totalBudget = lines.reduce((acc, curr) => acc + curr.allocated, 0)
  const clampedNewAmount = Math.max(
    0,
    Math.min(totalBudget, Math.round(newAmount))
  )
  const currentAllocated = lines[targetIndex].allocated
  const delta = clampedNewAmount - currentAllocated

  if (delta === 0) {
    return lines.map((l) => ({ ...l }))
  }

  const unlockedOthers = lines.filter((l) => l.id !== editedId && !l.locked)

  if (unlockedOthers.length === 0) {
    return lines.map((l) => ({ ...l }))
  }

  const availableOthersTotal = unlockedOthers.reduce(
    (acc, curr) => acc + curr.allocated,
    0
  )

  // If trying to increase more than unlocked lines can absorb, cap delta
  const effectiveDelta =
    delta > 0 && delta > availableOthersTotal ? availableOthersTotal : delta
  const finalEditedAmount = currentAllocated + effectiveDelta

  // Re-proportion the remaining amount among unlocked others
  const targetOthersTotal = availableOthersTotal - effectiveDelta

  const result: BudgetLine[] = lines.map((line) => {
    if (line.id === editedId) {
      return {
        ...line,
        allocated: finalEditedAmount,
      }
    }
    return { ...line }
  })

  if (availableOthersTotal > 0) {
    // Distribute targetOthersTotal across unlockedOthers using largest remainder
    const items = unlockedOthers.map((u) => ({
      id: u.id,
      label: u.label,
      percent: (u.allocated / availableOthersTotal) * 100,
    }))
    const distributedOthers = distributeWithLargestRemainder(
      items,
      targetOthersTotal
    )
    const mapNew = new Map(distributedOthers.map((d) => [d.id, d.allocated]))

    for (const item of result) {
      if (item.id !== editedId && !item.locked) {
        item.allocated = mapNew.get(item.id) ?? item.allocated
      }
    }
  } else {
    // Distribute evenly among unlocked others
    const evenShare = Math.floor(targetOthersTotal / unlockedOthers.length)
    let left = targetOthersTotal - evenShare * unlockedOthers.length
    for (const item of result) {
      if (item.id !== editedId && !item.locked) {
        item.allocated = evenShare + (left > 0 ? 1 : 0)
        if (left > 0) left -= 1
      }
    }
  }

  // Recalculate percentages
  for (const line of result) {
    line.percent =
      totalBudget > 0
        ? Number(((line.allocated / totalBudget) * 100).toFixed(2))
        : 0
  }

  return result
}

export interface BudgetSummary {
  totalAllocated: number
  totalSpent: number
  remaining: number
  perGuestCost: number
  status: 'on-track' | 'watch' | 'over'
  overspentCategories: BudgetCategoryId[]
  perLineStatus: Record<
    BudgetCategoryId,
    {
      allocated: number
      spent: number
      remaining: number
      isOverspent: boolean
    }
  >
}

/**
 * Summarizes the current budget posture comparing allocations against registered expenses.
 *
 * @param lines - Current budget lines.
 * @param expenses - List of incurred or tracked expenses.
 * @param guests - Number of guests for per-head calculation.
 * @returns Comprehensive summary metrics and health classification.
 */
export function summarize(
  lines: BudgetLine[],
  expenses: Expense[],
  guests: number
): BudgetSummary {
  const totalAllocated = lines.reduce((acc, curr) => acc + curr.allocated, 0)
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const remaining = totalAllocated - totalSpent

  const safeGuests = Math.max(1, guests)
  const perGuestCost = Math.round(totalAllocated / safeGuests)

  const commitmentRatio = totalAllocated > 0 ? totalSpent / totalAllocated : 0
  let status: 'on-track' | 'watch' | 'over' = 'on-track'
  if (commitmentRatio > 1.0) {
    status = 'over'
  } else if (commitmentRatio >= 0.85) {
    status = 'watch'
  }

  const categorySpentMap = new Map<BudgetCategoryId, number>()
  for (const exp of expenses) {
    const prev = categorySpentMap.get(exp.categoryId) ?? 0
    categorySpentMap.set(exp.categoryId, prev + exp.amount)
  }

  const overspentCategories: BudgetCategoryId[] = []
  const perLineStatus = {} as BudgetSummary['perLineStatus']

  for (const line of lines) {
    const spent = categorySpentMap.get(line.id) ?? line.spent ?? 0
    const lineRemaining = line.allocated - spent
    const isOverspent = spent > line.allocated

    if (isOverspent) {
      overspentCategories.push(line.id)
    }

    perLineStatus[line.id] = {
      allocated: line.allocated,
      spent,
      remaining: lineRemaining,
      isOverspent,
    }
  }

  return {
    totalAllocated,
    totalSpent,
    remaining,
    perGuestCost,
    status,
    overspentCategories,
    perLineStatus,
  }
}

/**
 * Simulates a 'what-if' scenario by altering budget total or guest count without mutating original profile.
 *
 * @param profile - Original event profile.
 * @param changes - Proposed changes to guests or budget total.
 * @returns Projected perGuestCost and rebuilt budget allocations.
 */
export function whatIf(
  profile: EventProfile,
  changes: { guests?: number; budgetTotal?: number }
): { perGuestCost: number; budget: BudgetLine[] } {
  const clonedProfile: EventProfile = {
    ...profile,
    guests: changes.guests ?? profile.guests,
    budgetTotal: changes.budgetTotal ?? profile.budgetTotal,
  }

  const newBudget = buildBudget(clonedProfile)
  const safeGuests = Math.max(1, clonedProfile.guests)
  const perGuestCost = Math.round(clonedProfile.budgetTotal / safeGuests)

  return {
    perGuestCost,
    budget: newBudget,
  }
}
