/**
 * Edge idempotency helper — Phase 8
 * Production: backed by idempotency_keys table via service_role
 */

const cache = new Map<string, { body: unknown; expiresAt: number }>()
const TTL_MS = 24 * 3600000

export function getCachedIdempotentResponse(scope: string, key: string): unknown | null {
  const entry = cache.get(`${scope}:${key}`)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(`${scope}:${key}`)
    return null
  }
  return entry.body
}

export function setCachedIdempotentResponse(
  scope: string,
  key: string,
  body: unknown,
): void {
  cache.set(`${scope}:${key}`, { body, expiresAt: Date.now() + TTL_MS })
}

export function requireIdempotencyKey(key: unknown, action: string): string {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error(`Idempotency key required for ${action}`)
  }
  return key.trim()
}
