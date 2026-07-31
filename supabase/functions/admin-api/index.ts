/**
 * DUBL admin edge API stub (Phase 8 hardened)
 * Deploy: supabase functions deploy admin-api
 * Route: /dubl-admin-7k2m9/api (production gateway)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { checkRateLimit, rateLimitHeaders } from '../_shared/rateLimit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-admin-reason',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('authorization') ?? 'admin-anon'
  const rl = checkRateLimit(`admin-api:${authHeader.slice(-16)}`, 30, 60_000)
  const rlHeaders = rateLimitHeaders(rl)

  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, ...rlHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { action, payload, reason } = await req.json()

    if (['ledger.adjustment', 'odds.update', 'collection.action'].includes(action) && !reason?.trim()) {
      return new Response(JSON.stringify({ error: 'Admin reason note required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ ok: true, action, payload, reason, mock: true }),
      { headers: { ...corsHeaders, ...rlHeaders, 'Content-Type': 'application/json' } },
    )
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
