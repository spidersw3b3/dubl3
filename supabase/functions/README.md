# Edge function stubs — Phase 8 hardened

## Player API (`dubl-api`)

Actions: `create_payment_intent`, `confirm_payment`, `execute_double_flip`,  
`link_bank_mock`, `link_card_mock`, `send_p2p`, `request_withdrawal`,  
`get_dashboard`, `list_transactions`, `crypto_send_mock`, `crypto_receive_address`, …

**Phase 8:**
- Rate limit: 120 req/min per auth token (in-memory per isolate)
- Money actions require `x-idempotency-key` header or `payload.idempotency_key`
- Idempotent replay returns cached response with `idempotent_replay: true`

## Admin API (`admin-api`)

Route: `/dubl-admin-7k2m9/api` (production gateway)

**Phase 8:**
- Rate limit: 30 req/min per admin token
- Mutations require `reason` in body → audit log (wired in mock admin UI)

## Shared (`_shared/`)

- `rateLimit.ts` — token bucket (replace with Redis in prod)
- `idempotency.ts` — in-memory cache (replace with `idempotency_keys` table in prod)

See [RLS_AUDIT.md](../docs/RLS_AUDIT.md) and [ARCHITECTURE.md](../docs/ARCHITECTURE.md).
