import { z } from 'zod'
import { extractJson, safeParseJson } from '@/lib/ai/jsonRepair'

describe('jsonRepair', () => {
  it('extracts plain JSON objects without modification', () => {
    const raw = '{"name": "Festora", "status": "active"}'
    expect(extractJson(raw)).toBe(raw)
  })

  it('strips markdown code fences correctly', () => {
    const fenced = '```json\n{"key": "value"}\n```'
    expect(extractJson(fenced)).toBe('{"key": "value"}')

    const genericFenced = '```\n{"key": "value"}\n```'
    expect(extractJson(genericFenced)).toBe('{"key": "value"}')
  })

  it('isolates the first balanced JSON object from surrounding conversational prose', () => {
    const surrounded =
      'Here is your requested JSON configuration:\n\n{"concept": "Royal Theme", "guests": 150}\n\nHope this helps your celebration!'
    const extracted = extractJson(surrounded)
    expect(extracted).toBe('{"concept": "Royal Theme", "guests": 150}')
  })

  it('handles strings containing braces and escaped quotes correctly', () => {
    const complex =
      '{"message": "Hello {nested} and \\"escaped quotes\\"", "count": 1}'
    const extracted = extractJson(complex)
    expect(extracted).toBe(complex)
  })

  it('parses and validates successfully with safeParseJson', () => {
    const schema = z.object({ title: z.string(), score: z.number() })
    const valid = '{"title": "Test", "score": 95}'
    const result = safeParseJson(valid, schema)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test')
      expect(result.data.score).toBe(95)
    }
  })

  it('returns syntax error diagnostics without throwing', () => {
    const schema = z.object({ title: z.string() })
    const broken = '{"title": broken}'
    const result = safeParseJson(broken, schema)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('JSON syntax error')
    }
  })

  it('returns schema validation error diagnostics without throwing', () => {
    const schema = z.object({ title: z.string(), score: z.number() })
    const mismatch = '{"title": "Test", "score": "not-a-number"}'
    const result = safeParseJson(mismatch, schema)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('score')
    }
  })
})
