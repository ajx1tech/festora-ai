import type {
  AiEnvelope,
  AiRequest,
  ChatResponse,
  IdeasResponse,
  InvitationResponse,
  RunOfShowResponse,
  VendorMessageResponse,
} from '@/lib/ai/aiSchemas'
import {
  ChatResponseSchema,
  IdeasResponseSchema,
  InvitationResponseSchema,
  RunOfShowResponseSchema,
  VendorMessageResponseSchema,
} from '@/lib/ai/aiSchemas'
import { generateContent } from '@/lib/ai/geminiClient'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import {
  buildChatPrompt,
  buildIdeasPrompt,
  buildInvitationPrompt,
  buildRepairPrompt,
  buildRunOfShowPrompt,
  buildVendorMessagePrompt,
} from '@/lib/ai/prompts'
import {
  fallbackChatAnswer,
  fallbackIdeas,
  fallbackInvitation,
  fallbackRunOfShow,
  fallbackVendorMessage,
} from '@/lib/engines/fallbackContent'

/**
 * Orchestrates AI execution across prompts, Gemini REST calls, validation, repair, and offline fallbacks.
 * Guarantees that callers always receive valid, usable data with an honest source attribution.
 *
 * @param request - Validated polymorphic AI task request.
 * @param signal - Optional cancellation signal.
 * @returns Standardized AiEnvelope wrapping data with source: 'gemini' | 'template'.
 */
export async function runAiTask(
  request: AiRequest,
  signal?: AbortSignal
): Promise<AiEnvelope> {
  switch (request.task) {
    case 'ideas': {
      const prompt = buildIdeasPrompt(request)
      const call = await generateContent({ ...prompt, signal })

      if (call.success) {
        const parsed = safeParseJson(call.text, IdeasResponseSchema)
        if (parsed.success) {
          return {
            ok: true,
            source: 'gemini',
            model: call.model,
            data: parsed.data,
          }
        }

        // Attempt exactly one repair
        const repairPrompt = buildRepairPrompt(
          parsed.rawExtracted,
          parsed.error
        )
        const repairCall = await generateContent({ ...repairPrompt, signal })
        if (repairCall.success) {
          const repaired = safeParseJson(repairCall.text, IdeasResponseSchema)
          if (repaired.success) {
            return {
              ok: true,
              source: 'gemini',
              model: repairCall.model,
              data: repaired.data,
            }
          }
        }
      }

      // Offline deterministic fallback
      const fallbackBundle = fallbackIdeas(request.plan.profile)
      const data: IdeasResponse = {
        concept: fallbackBundle.concept ?? 'A joyful family celebration.',
        themes: fallbackBundle.themes ?? [
          'Classic Elegance',
          'Vibrant Festive',
          'Botanical Warmth',
        ],
        ideas: (fallbackBundle.ideas ?? []).map((ideaTitle, idx) => ({
          title: ideaTitle,
          description: `Actionable celebration element focusing on guest hospitality and memorable ambiance.`,
          estimatedCostBand:
            idx % 3 === 0 ? 'low' : idx % 3 === 1 ? 'mid' : 'high',
          category: idx % 2 === 0 ? 'decor' : 'catering',
        })),
        savingTips: fallbackBundle.savingTips ?? [
          'Choose in-season flowers to lower decor costs.',
        ],
      }

      return {
        ok: true,
        source: 'template',
        data,
      }
    }

    case 'chat': {
      const prompt = buildChatPrompt(request)
      const call = await generateContent({ ...prompt, signal })

      if (call.success && call.text && call.text.trim().length > 0) {
        const answer = call.text.trim()
        const parsed = ChatResponseSchema.safeParse({ answer })
        if (parsed.success) {
          return {
            ok: true,
            source: 'gemini',
            model: call.model,
            data: parsed.data,
          }
        }
      }

      // Offline factual chat fallback
      const fallback = fallbackChatAnswer(request.message, request.plan)
      const data: ChatResponse = {
        answer: fallback.answer,
      }

      return {
        ok: true,
        source: 'template',
        data,
      }
    }

    case 'vendor_message': {
      const prompt = buildVendorMessagePrompt(request)
      const call = await generateContent({ ...prompt, signal })

      if (call.success) {
        const parsed = safeParseJson(call.text, VendorMessageResponseSchema)
        if (parsed.success) {
          return {
            ok: true,
            source: 'gemini',
            model: call.model,
            data: parsed.data,
          }
        }

        // Attempt repair
        const repairPrompt = buildRepairPrompt(
          parsed.rawExtracted,
          parsed.error
        )
        const repairCall = await generateContent({ ...repairPrompt, signal })
        if (repairCall.success) {
          const repaired = safeParseJson(
            repairCall.text,
            VendorMessageResponseSchema
          )
          if (repaired.success) {
            return {
              ok: true,
              source: 'gemini',
              model: repairCall.model,
              data: repaired.data,
            }
          }
        }
      }

      // Offline fallback
      const targetVendor = request.plan.vendors.find(
        (v) => v.id === request.vendorId
      ) ?? {
        id: request.vendorId,
        category: 'general',
        name: 'Vendor',
        status: 'researching',
        quote: 0,
        notes: '',
      }

      const fallback = fallbackVendorMessage(request.plan.profile, targetVendor)
      const data: VendorMessageResponse = {
        subject: fallback.subject,
        message: fallback.message,
      }

      return {
        ok: true,
        source: 'template',
        data,
      }
    }

    case 'invitation': {
      const prompt = buildInvitationPrompt(request)
      const call = await generateContent({ ...prompt, signal })

      if (call.success) {
        const parsed = safeParseJson(call.text, InvitationResponseSchema)
        if (parsed.success) {
          return {
            ok: true,
            source: 'gemini',
            model: call.model,
            data: parsed.data,
          }
        }

        // Attempt repair
        const repairPrompt = buildRepairPrompt(
          parsed.rawExtracted,
          parsed.error
        )
        const repairCall = await generateContent({ ...repairPrompt, signal })
        if (repairCall.success) {
          const repaired = safeParseJson(
            repairCall.text,
            InvitationResponseSchema
          )
          if (repaired.success) {
            return {
              ok: true,
              source: 'gemini',
              model: repairCall.model,
              data: repaired.data,
            }
          }
        }
      }

      // Offline multilingual invitation fallbacks
      const variantA = fallbackInvitation(
        request.plan.profile,
        request.tone,
        request.language
      )
      const variantB = fallbackInvitation(
        request.plan.profile,
        request.tone === 'formal' ? 'warm' : 'formal',
        request.language
      )

      const data: InvitationResponse = {
        variantA: {
          title: variantA.title,
          body: variantA.body,
          rsvp: variantA.rsvp,
        },
        variantB: {
          title: variantB.title,
          body: variantB.body,
          rsvp: variantB.rsvp,
        },
      }

      return {
        ok: true,
        source: 'template',
        data,
      }
    }

    case 'run_of_show': {
      const prompt = buildRunOfShowPrompt(request)
      const call = await generateContent({ ...prompt, signal })

      if (call.success) {
        const parsed = safeParseJson(call.text, RunOfShowResponseSchema)
        if (parsed.success) {
          return {
            ok: true,
            source: 'gemini',
            model: call.model,
            data: parsed.data,
          }
        }

        // Attempt repair
        const repairPrompt = buildRepairPrompt(
          parsed.rawExtracted,
          parsed.error
        )
        const repairCall = await generateContent({ ...repairPrompt, signal })
        if (repairCall.success) {
          const repaired = safeParseJson(
            repairCall.text,
            RunOfShowResponseSchema
          )
          if (repaired.success) {
            return {
              ok: true,
              source: 'gemini',
              model: repairCall.model,
              data: repaired.data,
            }
          }
        }
      }

      // Offline deterministic run of show
      const fallbackItems = fallbackRunOfShow(request.plan.profile)
      const data: RunOfShowResponse = {
        items: fallbackItems.map((item) => ({
          time: item.time,
          title: item.title,
          detail: item.detail,
        })),
      }

      return {
        ok: true,
        source: 'template',
        data,
      }
    }
  }
}
