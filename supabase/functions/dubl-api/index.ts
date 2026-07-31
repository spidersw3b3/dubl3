/**
 * DUBL player-facing edge API (Phase 8 hardened)
 * Deploy: supabase functions deploy dubl-api
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  getCachedIdempotentResponse,
  requireIdempotencyKey,
  setCachedIdempotentResponse,
} from '../_shared/idempotency.ts'
import { checkRateLimit, rateLimitHeaders } from '../_shared/rateLimit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-idempotency-key',
}

const MONEY_ACTIONS = new Set([
  'create_payment_intent',
  'confirm_payment',
  'execute_double_flip',
  'send_p2p',
  'crypto_send_mock',
  'request_withdrawal',
])

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization') ?? 'anon'
    const clientKey = authHeader.slice(-16)
    const rl = checkRateLimit(`dubl-api:${clientKey}`, 120, 60_000)
    const rlHeaders = rateLimitHeaders(rl)

    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, ...rlHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, payload } = await req.json()
    const idempotencyKey =
      req.headers.get('x-idempotency-key') ??
      (payload?.idempotency_key as string | undefined)

    if (MONEY_ACTIONS.has(action) && idempotencyKey) {
      const cached = getCachedIdempotentResponse(action, idempotencyKey)
      if (cached) {
        return new Response(JSON.stringify({ ...cached as object, idempotent_replay: true }), {
          headers: { ...corsHeaders, ...rlHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    if (MONEY_ACTIONS.has(action) && !idempotencyKey) {
      requireIdempotencyKey(undefined, action)
    }

    // Phase 8+: wire to Supabase service_role + dubl_wallet_movement RPC
    const body = { ok: true, action, payload, mock: true }
    if (MONEY_ACTIONS.has(action) && idempotencyKey) {
      setCachedIdempotentResponse(action, idempotencyKey, body)
    }

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, ...rlHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request'
    const status = message.includes('Idempotency') ? 400 : 400
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
