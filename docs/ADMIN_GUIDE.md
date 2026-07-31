# DUBL Admin Guide

**Status:** Phase 7 complete — Phase 8 hardening (idempotency, RLS audit) in [RLS_AUDIT.md](./RLS_AUDIT.md)

## Route

`/dubl-admin-7k2m9/*` — not linked from player UI.

Set `VITE_ADMIN_DISABLED=true` to kill admin routes in production builds.

## Dev login

| Field | Value |
|-------|-------|
| Email | `admin@dubl.app` |
| Password | `AdminDubl123!` |

Session stored in `localStorage` (`dubl-admin-session`), 8-hour TTL.

## Nav groups

1. **Command** — KPI band (GMV, double volume, win rate, obligations, users, ledger count)
2. **Users** — search + User 360 drawer (wallet, txns, dubls, obligations, ledger adjustment)
3. **Transactions** — unified ledger explorer with filters, row expand, CSV export
4. **Double Engine** — edit `dubl_odds_config` (mock runtime; audit logged)
5. **Collections** — open obligations queue (retry ACH, mark paid, write off)
6. **Audit Log** — append-only admin mutation log with reason notes

## Roles (planned → mock)

| Role | Access |
|------|--------|
| `support` | User lookup, read-only transactions |
| `ops` | Feature flags, test accounts |
| `finance` | Ledger explorer, reconciliation, adjustments |
| `compliance` | KYC, legal acceptances, tax docs |
| `master` | Full access (dev login uses master) |

## Key workflows

1. **Transaction explorer** — filter by type/user; expand row for metadata + reference trail
2. **Double Engine** — update win probability / caps; confirm + reason → audit
3. **Collections** — obligations from double losses; mock ACH retry or manual resolve
4. **Ledger adjustment** — User 360 → finance/master only; confirm + reason → audit

Every admin mutation requires **confirm dialog + reason note** → `admin_audit_log` (mock in-memory).

See [ARCHITECTURE.md](./ARCHITECTURE.md) for edge API action registry.
