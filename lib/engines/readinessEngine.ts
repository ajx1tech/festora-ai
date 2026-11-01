import type { EventPlan } from '@/lib/domain/schemas'
import { summarize } from '@/lib/engines/budgetEngine'
import { daysUntil, getOverdue } from '@/lib/engines/timelineEngine'
import { VENDOR_CATALOG } from '@/lib/engines/vendorEngine'

export type ReadinessLabel =
  'Needs attention' | 'On track' | 'Ahead' | 'Event ready'

export interface ReadinessAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  action: string
}

export interface ReadinessBreakdown {
  taskScore: number
  vendorScore: number
  budgetScore: number
  slackScore: number
}

export interface ReadinessResult {
  score: number
  label: ReadinessLabel
  breakdown: ReadinessBreakdown
  alerts: ReadinessAlert[]
}

/**
 * Computes an objective readiness score and contextual alerts for an event plan.
 * Pure logic weighting tasks (40%), critical vendors (30%), budget health (20%), and slack (10%).
 *
 * @param plan - Complete composite EventPlan.
 * @param now - Reference current Date.
 * @returns Score (0-100), health classification label, component breakdown, and actionable alerts.
 */
export function computeReadiness(plan: EventPlan, now: Date): ReadinessResult {
  const daysLeft = daysUntil(plan.profile.dateISO, now)
  const todayStr = now.toISOString().split('T')[0]

  // 1. Task Completion Score (Weight 40%)
  const totalTasks = plan.tasks.length
  let taskScore = 0
  if (totalTasks === 0) {
    taskScore = 40
  } else {
    const dueTasks = plan.tasks.filter((t) => t.dueISO <= todayStr)
    const completedTasks = plan.tasks.filter((t) => t.done).length

    if (dueTasks.length === 0) {
      // Runway is ahead; give credit for overall progress
      taskScore = 40 * Math.max(0.6, completedTasks / totalTasks)
    } else {
      const dueCompleted = dueTasks.filter((t) => t.done).length
      const dueRatio = dueCompleted / dueTasks.length
      const overallRatio = completedTasks / totalTasks
      taskScore = 40 * (dueRatio * 0.75 + overallRatio * 0.25)
    }

    // Penalty for overdue critical tasks
    const overdueCritical = plan.tasks.filter(
      (t) => !t.done && t.critical && t.dueISO < todayStr
    )
    taskScore = Math.max(0, taskScore - overdueCritical.length * 4)
  }

  // 2. Vendor Booking Score (Weight 30%)
  const catalog = VENDOR_CATALOG[plan.profile.type]
  const criticalCatalog = catalog.filter((c) => c.critical)
  let vendorScore = 0

  if (criticalCatalog.length === 0) {
    vendorScore = 30
  } else {
    let bookedCriticalCount = 0
    let overdueVendorPenalty = 0

    for (const crit of criticalCatalog) {
      const vendorRow = plan.vendors.find((v) => v.category === crit.category)
      const isBooked =
        vendorRow &&
        (vendorRow.status === 'booked' || vendorRow.status === 'paid')

      if (isBooked) {
        bookedCriticalCount += 1
      } else if (daysLeft < crit.typicalLeadDays) {
        overdueVendorPenalty += 3
      }
    }

    const baseVendorRatio = bookedCriticalCount / criticalCatalog.length
    vendorScore = Math.max(0, baseVendorRatio * 30 - overdueVendorPenalty)
  }

  // 3. Budget Health Score (Weight 20%)
  const budgetSummary = summarize(
    plan.budget,
    plan.expenses,
    plan.profile.guests
  )
  let budgetScore = 20

  if (budgetSummary.status === 'over') {
    budgetScore = 4
  } else if (budgetSummary.status === 'watch') {
    budgetScore = 14
  } else {
    budgetScore = 20
  }

  if (budgetSummary.overspentCategories.length > 0) {
    budgetScore = Math.max(
      0,
      budgetScore - budgetSummary.overspentCategories.length * 3
    )
  }

  // 4. Schedule Slack Score (Weight 10%)
  const isCompressed = plan.tasks.some((t) => t.compressed)
  const overdueAll = getOverdue(plan.tasks, now)
  let slackScore = 10

  if (isCompressed) {
    slackScore = Math.max(3, slackScore - 5)
  }
  if (overdueAll.length > 0) {
    slackScore = Math.max(0, slackScore - overdueAll.length * 2)
  }

  // Aggregate Total Score
  const rawTotal = taskScore + vendorScore + budgetScore + slackScore
  const finalScore = Math.max(0, Math.min(100, Math.round(rawTotal)))

  // Determine Quality Label
  let label: ReadinessLabel = 'Needs attention'
  if (finalScore >= 90) {
    label = 'Event ready'
  } else if (finalScore >= 75) {
    label = 'Ahead'
  } else if (finalScore >= 50) {
    label = 'On track'
  } else {
    label = 'Needs attention'
  }

  // 5. Deterministic Alerts
  const alerts: ReadinessAlert[] = []

  // Alert: Venue Unbooked near date
  const venueVendor = plan.vendors.find((v) => v.category === 'venue')
  const venueBooked =
    venueVendor &&
    (venueVendor.status === 'booked' || venueVendor.status === 'paid')

  if (!venueBooked && daysLeft <= 60) {
    alerts.push({
      id: 'alert-venue-urgent',
      severity: 'critical',
      title: 'Primary Venue Not Booked',
      message: `The event is scheduled in ${daysLeft} days, but no venue contract has been marked as booked.`,
      action: 'Finalize and book the venue immediately to secure the date.',
    })
  }

  // Alert: Overdue Critical Tasks
  const overdueCritical = plan.tasks.filter(
    (t) => !t.done && t.critical && t.dueISO < todayStr
  )
  if (overdueCritical.length > 0) {
    alerts.push({
      id: 'alert-critical-tasks',
      severity: 'critical',
      title: `${overdueCritical.length} Critical Task(s) Overdue`,
      message: `Urgent attention required on: ${overdueCritical
        .slice(0, 2)
        .map((t) => t.title)
        .join('; ')}.`,
      action: 'Complete or adjust deadlines for blocked milestone tasks.',
    })
  }

  // Alert: Budget Overspend
  if (budgetSummary.overspentCategories.length > 0) {
    alerts.push({
      id: 'alert-budget-overspend',
      severity: budgetSummary.status === 'over' ? 'critical' : 'warning',
      title: 'Budget Allocation Exceeded',
      message: `Recorded expenses exceed allocation in: ${budgetSummary.overspentCategories.join(
        ', '
      )}.`,
      action:
        'Rebalance allocations from unlocked lines or trim pending vendor commitments.',
    })
  }

  // Alert: Compressed Timeline
  if (isCompressed) {
    alerts.push({
      id: 'alert-compressed-schedule',
      severity: 'warning',
      title: 'Compressed Planning Window',
      message:
        'This event was initiated with a condensed runway. Tasks have been proportionally accelerated into compressed mode.',
      action:
        'Prioritize critical milestone tasks and book high-lead vendors first.',
    })
  }

  // Alert: High Guest Density
  if (plan.profile.guests > 300 && plan.profile.venueType === 'indoor') {
    alerts.push({
      id: 'alert-indoor-capacity',
      severity: 'info',
      title: 'High Guest Density for Indoor Venue',
      message: `Hosting ${plan.profile.guests} guests indoors requires careful scrutiny of room fire exits, air ventilation, and buffet lane clearance.`,
      action:
        'Confirm seating chart square footage with your venue coordinator.',
    })
  }

  return {
    score: finalScore,
    label,
    breakdown: {
      taskScore: Math.round(taskScore),
      vendorScore: Math.round(vendorScore),
      budgetScore: Math.round(budgetScore),
      slackScore: Math.round(slackScore),
    },
    alerts,
  }
}
