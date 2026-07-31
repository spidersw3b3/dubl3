/** Provably-fair HMAC roll — mirrors server-side edge fn logic */

const DEV_SERVER_SEED = 'dubl-dev-server-seed-do-not-use-in-prod'
export const DEV_SERVER_SEED_HASH = 'sha256:dev-mvp-seed-v1'

async function hmacSha256(key: string, message: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Returns float [0, 1) and hex digest for audit display */
export async function provablyFairRoll(
  serverSeed: string,
  userId: string,
  intentId: string,
  nonce: string,
): Promise<{ roll: number; digest: string }> {
  const message = `${userId}:${intentId}:${nonce}`
  const sig = await hmacSha256(serverSeed, message)
  const digest = bufferToHex(sig)
  // Use first 8 hex chars (32 bits) for roll
  const intVal = parseInt(digest.slice(0, 8), 16)
  const roll = intVal / 0x100000000
  return { roll, digest }
}

export function isWin(roll: number, winProbability: number): boolean {
  return roll < winProbability
}

export { DEV_SERVER_SEED }
