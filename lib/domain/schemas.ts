import { z } from 'zod'

/**
 * Event type categorization for custom themes, engines, and templates.
 */
export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community'])
export type EventType = z.infer<typeof EventTypeSchema>

/**
 * Supported currencies across Indian and global markets.
 */
export const CurrencySchema = z.enum(['INR', 'USD', 'EUR', 'GBP'])
export type Currency = z.infer<typeof CurrencySchema>

/**
 * Venue layout types.
 */
export const VenueTypeSchema = z.enum(['indoor', 'outdoor', 'hybrid'])
export type VenueType = z.infer<typeof VenueTypeSchema>

/**
 * Categorical identifiers used across all budgeting and vendor templates.
 */
export const BudgetCategoryIdSchema = z.enum([
  'venue',
  'catering',
  'decor',
  'photography',
  'attire',
  'music',
  'invitations',
  'transport',
  'rituals',
  'cake',
  'entertainment',
  'food',
  'av',
  'volunteers',
  'promotion',
  'safety',
  'contingency',
])
export type BudgetCategoryId = z.infer<typeof BudgetCategoryIdSchema>

/**
 * Core event profile capturing user inputs from wizard.
 */
export const EventProfileSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required').max(100),
  type: EventTypeSchema,
  dateISO: z
    .string()
    .trim()
    .max(30)
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
      'Invalid ISO date format'
    ),
  guests: z
    .number()
    .int('Guest count must be an integer')
    .min(1, 'At least 1 guest required')
    .max(5000, 'Maximum 5000 guests supported'),
  budgetTotal: z
    .number()
    .int('Budget total must be an integer')
    .positive('Budget must be greater than zero'),
  currency: CurrencySchema,
  city: z.string().trim().min(1, 'City is required').max(100),
  venueType: VenueTypeSchema,
  vibes: z.array(z.string().trim().max(50)).max(6),
  dietary: z.array(z.string().trim().max(50)).max(6),
  traditions: z.string().trim().max(300),
  priorities: z.array(BudgetCategoryIdSchema).max(3),
})
export type EventProfile = z.infer<typeof EventProfileSchema>

/**
 * A discrete budget allocation line item.
 */
export const BudgetLineSchema = z.object({
  id: BudgetCategoryIdSchema,
  label: z.string().trim().min(1).max(100),
  percent: z.number().min(0).max(100),
  allocated: z.number().int().min(0),
  spent: z.number().int().min(0),
  locked: z.boolean(),
})
export type BudgetLine = z.infer<typeof BudgetLineSchema>

/**
 * Timeline task item with dependency and execution metadata.
 */
export const TaskSchema = z.object({
  id: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  dueISO: z.string().trim().max(30),
  phase: z.string().trim().min(1).max(100),
  critical: z.boolean(),
  done: z.boolean(),
  source: z.enum(['template', 'ai', 'user']),
  notes: z.string().trim().max(1000),
  compressed: z.boolean().optional(),
})
export type Task = z.infer<typeof TaskSchema>

/**
 * Vendor checklist item tracking quotes and status.
 */
export const VendorSchema = z.object({
  id: z.string().trim().min(1).max(50),
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  status: z.enum(['researching', 'contacted', 'quoted', 'booked', 'paid']),
  quote: z.number().int().min(0),
  notes: z.string().trim().max(1000),
})
export type Vendor = z.infer<typeof VendorSchema>

/**
 * Recorded expense entry linked to a budget category.
 */
export const ExpenseSchema = z.object({
  id: z.string().trim().min(1).max(50),
  categoryId: BudgetCategoryIdSchema,
  label: z.string().trim().min(1).max(100),
  amount: z.number().int().min(0),
})
export type Expense = z.infer<typeof ExpenseSchema>

/**
 * Creative AI enrichments bundle with fallback support.
 */
export const AiBundleSchema = z.object({
  concept: z.string().trim().max(2000).nullable(),
  themes: z.array(z.string().trim().max(100)).max(10).nullable(),
  ideas: z.array(z.string().trim().max(500)).max(20).nullable(),
  savingTips: z.array(z.string().trim().max(500)).max(10).nullable(),
  source: z.string().trim().max(50).nullable(),
  model: z.string().trim().max(50).nullable(),
  generatedAtISO: z.string().trim().max(30).nullable(),
})
export type AiBundle = z.infer<typeof AiBundleSchema>

/**
 * Day-of-event schedule item.
 */
export const RunOfShowItemSchema = z.object({
  time: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(150),
  detail: z.string().trim().max(500),
})
export type RunOfShowItem = z.infer<typeof RunOfShowItemSchema>

/**
 * Top-level composite event plan data structure.
 */
export const EventPlanSchema = z.object({
  id: z.string().trim().min(1).max(50),
  createdAtISO: z.string().trim().max(30),
  schemaVersion: z.number().int().positive(),
  profile: EventProfileSchema,
  budget: z.array(BudgetLineSchema),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorSchema),
  expenses: z.array(ExpenseSchema),
  aiBundle: AiBundleSchema.nullable(),
  runOfShow: z.array(RunOfShowItemSchema),
})
export type EventPlan = z.infer<typeof EventPlanSchema>

/**
 * Typed safe parse outcome wrapper avoiding unhandled exceptions.
 */
export type ParseResult<T> =
  { success: true; data: T } | { success: false; error: string }

/**
 * Parses raw data into an EventProfile without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated EventProfile or error message.
 */
export function parseEventProfile(input: unknown): ParseResult<EventProfile> {
  const result = EventProfileSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into an EventPlan without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated EventPlan or error message.
 */
export function parseEventPlan(input: unknown): ParseResult<EventPlan> {
  const result = EventPlanSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into a BudgetLine without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated BudgetLine or error message.
 */
export function parseBudgetLine(input: unknown): ParseResult<BudgetLine> {
  const result = BudgetLineSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into a Task without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated Task or error message.
 */
export function parseTask(input: unknown): ParseResult<Task> {
  const result = TaskSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into a Vendor without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated Vendor or error message.
 */
export function parseVendor(input: unknown): ParseResult<Vendor> {
  const result = VendorSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into an Expense without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated Expense or error message.
 */
export function parseExpense(input: unknown): ParseResult<Expense> {
  const result = ExpenseSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}

/**
 * Parses raw data into an AiBundle without throwing errors.
 *
 * @param input - Raw data payload to validate.
 * @returns Typed ParseResult with validated AiBundle or error message.
 */
export function parseAiBundle(input: unknown): ParseResult<AiBundle> {
  const result = AiBundleSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((i) => i.message).join(', '),
  }
}
