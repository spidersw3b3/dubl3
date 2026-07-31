/** In-memory idempotency store — mirrors idempotency_keys table for mock mode */

interface IdempotencyEntry {
  response: unknown
  createdAt: number
}

const store = new Map<string, IdempotencyEntry>()

export const IDEMPOTENCY_TTL_MS = 24 * 3600000

export function idempotencyCacheKey(scope: string, key: string): string {
  return `${scope}:${key}`
}

export function getIdempotentResponse<T>(scope: string, key: string): T | null {
  if (!key) return null
  const cacheKey = idempotencyCacheKey(scope, key)
  const entry = store.get(cacheKey)
  if (!entry) return null
  if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
    store.delete(cacheKey)
    return null
  }
  return entry.response as T
}

export function setIdempotentResponse(scope: string, key: string, response: unknown): void {
  if (!key) return
  store.set(idempotencyCacheKey(scope, key), {
    response,
    createdAt: Date.now(),
  })
}

/** Test helper — clear all cached idempotency responses */
export function clearIdempotencyStore(): void {
  store.clear()
}

export function requireIdempotencyKey(key: string | undefined, action: string): string {
  if (!key?.trim()) {
    throw new Error(`Idempotency key required for ${action}`)
  }
  return key.trim()
}
