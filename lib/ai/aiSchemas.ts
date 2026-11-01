import { z } from 'zod'
import { EventPlanSchema } from '@/lib/domain/schemas'

/**
 * Task-specific schemas for inbound AI requests.
 */
export const IdeasRequestSchema = z.object({
  task: z.literal('ideas'),
  plan: EventPlanSchema,
  notes: z.string().trim().max(300).optional(),
})
export type IdeasRequest = z.infer<typeof IdeasRequestSchema>

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().trim().min(1).max(600),
})

export const ChatRequestSchema = z.object({
  task: z.literal('chat'),
  plan: EventPlanSchema,
  message: z.string().trim().min(1).max(600),
  history: z.array(ChatMessageSchema).max(6).optional(),
})
export type ChatRequest = z.infer<typeof ChatRequestSchema>

export const VendorMessageRequestSchema = z.object({
  task: z.literal('vendor_message'),
  plan: EventPlanSchema,
  vendorId: z.string().trim().min(1).max(50),
  notes: z.string().trim().max(300).optional(),
})
export type VendorMessageRequest = z.infer<typeof VendorMessageRequestSchema>

export const InvitationRequestSchema = z.object({
  task: z.literal('invitation'),
  plan: EventPlanSchema,
  tone: z.enum(['formal', 'playful', 'heartfelt']),
  language: z.string().trim().min(1).max(30),
})
export type InvitationRequest = z.infer<typeof InvitationRequestSchema>

export const RunOfShowRequestSchema = z.object({
  task: z.literal('run_of_show'),
  plan: EventPlanSchema,
  notes: z.string().trim().max(300).optional(),
})
export type RunOfShowRequest = z.infer<typeof RunOfShowRequestSchema>

/**
 * Discriminated union of all inbound AI task requests.
 */
export const AiRequestSchema = z.discriminatedUnion('task', [
  IdeasRequestSchema,
  ChatRequestSchema,
  VendorMessageRequestSchema,
  InvitationRequestSchema,
  RunOfShowRequestSchema,
])
export type AiRequest = z.infer<typeof AiRequestSchema>

/**
 * Response schemas for validated structured output.
 */
export const IdeaItemSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(600),
  estimatedCostBand: z.enum(['low', 'mid', 'high']),
  category: z.string().trim().min(1).max(100),
})
export type IdeaItem = z.infer<typeof IdeaItemSchema>

export const IdeasResponseSchema = z.object({
  concept: z.string().trim().min(1).max(2000),
  themes: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
  ideas: z.array(IdeaItemSchema).min(1).max(15),
  savingTips: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
})
export type IdeasResponse = z.infer<typeof IdeasResponseSchema>

export const ChatResponseSchema = z.object({
  answer: z.string().trim().min(1).max(1500),
})
export type ChatResponse = z.infer<typeof ChatResponseSchema>

export const VendorMessageResponseSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
})
export type VendorMessageResponse = z.infer<typeof VendorMessageResponseSchema>

export const InvitationVariantSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  rsvp: z.string().trim().min(1).max(300),
})
export type InvitationVariant = z.infer<typeof InvitationVariantSchema>

export const InvitationResponseSchema = z.object({
  variantA: InvitationVariantSchema,
  variantB: InvitationVariantSchema,
})
export type InvitationResponse = z.infer<typeof InvitationResponseSchema>

export const RunOfShowItemResponseSchema = z.object({
  time: z.string().trim().min(1).max(30),
  title: z.string().trim().min(1).max(150),
  detail: z.string().trim().min(1).max(500),
})

export const RunOfShowResponseSchema = z.object({
  items: z.array(RunOfShowItemResponseSchema).min(1).max(20),
})
export type RunOfShowResponse = z.infer<typeof RunOfShowResponseSchema>

/**
 * Standard envelope returned to browser client for all AI interactions.
 */
export interface AiEnvelope<T = unknown> {
  ok: true
  source: 'gemini' | 'template'
  model?: string
  data: T
}
