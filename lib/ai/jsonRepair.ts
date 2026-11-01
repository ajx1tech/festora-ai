import type { z } from 'zod'

/**
 * Extracts the first balanced JSON object or array from raw text, removing code fences and wrapping prose.
 *
 * @param text - The raw model output string containing potential markdown code blocks.
 * @returns Clean JSON string ready for JSON.parse.
 */
export function extractJson(text: string): string {
  let cleaned = text.trim()

  // Remove markdown code fences if present (```json ... ``` or ``` ... ```)
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i
  const fenceMatch = cleaned.match(fenceRegex)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  } else {
    // If text contains a code fence somewhere inside it
    const innerMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (innerMatch) {
      cleaned = innerMatch[1].trim()
    }
  }

  // Find the first balanced { ... } or [ ... ]
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')

  let startIndex = -1
  let openChar = ''
  let closeChar = ''

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace
    openChar = '{'
    closeChar = '}'
  } else if (firstBracket !== -1) {
    startIndex = firstBracket
    openChar = '['
    closeChar = ']'
  }

  if (startIndex === -1) {
    return cleaned
  }

  let depth = 0
  let inString = false
  let isEscaped = false
  let endIndex = -1

  for (let i = startIndex; i < cleaned.length; i += 1) {
    const char = cleaned[i]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === '"') {
        inString = false
      }
    } else {
      if (char === '"') {
        inString = true
      } else if (char === openChar) {
        depth += 1
      } else if (char === closeChar) {
        depth -= 1
        if (depth === 0) {
          endIndex = i
          break
        }
      }
    }
  }

  if (endIndex !== -1) {
    return cleaned.slice(startIndex, endIndex + 1)
  }

  return cleaned
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; rawExtracted: string }

/**
 * Attempts to extract, parse, and validate JSON from model output using a specified Zod schema.
 *
 * @param text - Raw output string from AI generation.
 * @param schema - Target Zod schema to validate structure against.
 * @returns SafeParseResult with validated data or diagnostic error.
 */
export function safeParseJson<T>(
  text: string,
  schema: z.ZodType<T>
): SafeParseResult<T> {
  const extracted = extractJson(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(extracted)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON syntax'
    return {
      success: false,
      error: `JSON syntax error: ${message}`,
      rawExtracted: extracted,
    }
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
      rawExtracted: extracted,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
