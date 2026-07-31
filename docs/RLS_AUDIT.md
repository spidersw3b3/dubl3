# DUBL RLS Audit — Phase 8

**Author:** spidersw3b3  
**Last verified:** Phase 8 hardening migration

## Money table policy summary

| Table | Player SELECT | Player INSERT/UPDATE/DELETE | Mutations path |
|-------|---------------|-------------------------------|----------------|
| `wallets` | Own row | **REVOKED** + trigger guard | `dubl_wallet_movement()` RPC only |
| `transactions` | Own rows | **REVOKED** | Append via RPC only |
| `idempotency_keys` | **None** | **REVOKED** | Edge fn service_role |
| `payment_intents` | Own rows (Phase 5) | Edge fn only | dubl-api |
| `admin_*` | **None** | **None** | admin-api service_role |

## Wallet mint lockdown

Migration `20260730000009_phase8_hardening.sql`:

1. `REVOKE INSERT, UPDATE, DELETE` on `wallets` / `transactions` from `anon`, `authenticated`
2. `guard_wallet_direct_mutation()` trigger — blocks UPDATE unless session flag `dubl.allow_wallet_mutation=true`
3. `dubl_wallet_movement()` sets flag via `set_config` before wallet UPDATE

## Verification queries (run in SQL editor)

```sql
-- No client write policies on wallets
SELECT polname, polcmd FROM pg_policies WHERE tablename = 'wallets';

-- Trigger present
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.wallets'::regclass;

-- RPC executable only by service_role
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'dubl_wallet_movement';
```

## Client checklist

- [x] No service role key in Vite client bundle
- [x] Mock mode uses in-memory ledger (no direct Supabase wallet writes)
- [x] Production path: Client → edge fn → idempotency → RPC
- [ ] Periodic reconciliation job compares wallet balance vs ledger net (admin Reconcile button in mock)

## Known MVP gaps (Phase 9+)

- Edge fn idempotency cache is in-memory per isolate (use Postgres `idempotency_keys` in prod)
- Rate limits are in-memory per isolate (use Redis/KV in prod)
