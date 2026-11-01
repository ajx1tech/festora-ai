let sequenceCounter = 0

/**
 * Generates a collision-resistant unique identifier without relying on Date.now().
 *
 * @param prefix - Optional string prefix identifying the entity type.
 * @returns A unique identifier string combining prefix, sequence counter, and random characters.
 */
export function generateId(prefix: string = 'id'): string {
  sequenceCounter += 1
  const randomPart = Math.random().toString(36).substring(2, 9)
  return `${prefix}-${sequenceCounter}-${randomPart}`
}

/**
 * Resets the sequence counter to zero (primarily for deterministic test setups).
 *
 * @returns Void.
 */
export function resetIdCounter(): void {
  sequenceCounter = 0
}
