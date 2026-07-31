# DUBL Admin Guide

**Status:** Phase 0 stub — full admin panel ships Phase 7.

## Route

`/dubl-admin-7k2m9/*` — not linked from player UI.

Set `VITE_ADMIN_DISABLED=true` to kill admin routes in production builds.

## Roles (planned)

| Role | Access |
|------|--------|
| `support` | User lookup, read-only transactions |
| `ops` | Feature flags, test accounts |
| `finance` | Ledger explorer, reconciliation, adjustments (maker-checker) |
| `compliance` | KYC, legal acceptances, tax docs |
| `master` | Full access + admin RBAC |

## Key workflows

1. **Transaction explorer** — unified ledger, expand row for payment_intent + double_attempt + idempotency trail
2. **Double Engine** — odds config, attempt feed, partner boosts
3. **Collections** — obligations aging, mock ACH retry, manual mark paid/written off
4. **Audit log** — every mutation requires reason note

See [ARCHITECTURE.md](./ARCHITECTURE.md) for edge API action registry.
