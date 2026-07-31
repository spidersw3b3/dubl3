# DUBL — Mock vs Production Manifest

**Author:** spidersw3b3  
**Last updated:** Phase 9 — Partner Boosts

Every feature in the DUBL MVP is tagged with one of three statuses:

| Tag | Meaning |
|-----|---------|
| 🟢 **LIVE** | Real wiring, production-ready path |
| 🟡 **MOCK** | Functional UI + local/DB simulation |
| 🔴 **STUB** | UI only, disabled with tooltip |

Test accounts see a visible 🟡 badge on mock features (dev + `is_test_account` users).

---

## Phase 9 — Partner Boosts

| Feature | Status | Notes |
|---------|--------|-------|
| partner_brands admin CRUD | 🟢 LIVE | Admin → Partners |
| Merchant tag → boosted win % | 🟢 LIVE | Pay modal matches tags (e.g. Coffee Shop → Starbucks) |
| Partner boost badge in Pay | 🟢 LIVE | Shows boosted odds + subsidy remaining |
| Subsidy burn on partner win | 🟡 MOCK | Records event + increments subsidy_used |
| Subsidy burn report + CSV | 🟢 LIVE | Admin Partners page |
| partner_brands migration | 🟢 LIVE | Phase 9 SQL + seed Nike/Starbucks/Target |

---

## Phase 8 — Hardening

| Feature | Status | Notes |
|---------|--------|-------|
| Idempotency (confirm_payment, p2p, crypto) | 🟢 LIVE | mockIdempotency + edge fn stub |
| Rate limiting edge fns | 🟢 LIVE | dubl-api 120/min, admin-api 30/min |
| RLS wallet mint lockdown | 🟢 LIVE | REVOKE + trigger guard migration |
| Reconciliation export | 🟢 LIVE | Admin Transactions → Reconcile CSV |
| E2E smoke tests | 🟢 LIVE | `npm run test:smoke` (vitest) |
| reconciliation_runs table | 🟢 LIVE | Phase 8 SQL (cron target) |

---

## Phase 7 — Admin Panel

| Feature | Status | Notes |
|---------|--------|-------|
| Admin login (mock JWT session) | 🟡 MOCK | admin@dubl.app / AdminDubl123! |
| Command KPIs | 🟢 LIVE | Aggregates mock player ledger |
| User 360 drawer | 🟢 LIVE | Wallet, txns, dubls, obligations |
| Transaction explorer | 🟢 LIVE | Filters, expand row, CSV export |
| Double Engine config UI | 🟢 LIVE | Updates runtime odds + audit |
| Collections queue | 🟢 LIVE | Mark paid / write off / retry ACH |
| Audit log | 🟢 LIVE | Reason required on mutations |
| Ledger adjustment | 🟡 MOCK | User 360; finance/master roles |
| admin_users + audit migration | 🟢 LIVE | Phase 7 SQL |
| Kill switch | 🟢 LIVE | VITE_ADMIN_DISABLED |

---

## Phase 6 — P2P & Referrals

| Feature | Status | Notes |
|---------|--------|-------|
| Username search | 🟢 LIVE | Mock directory + autocomplete in Send sheet |
| Friends list | 🟢 LIVE | Seeded for test user; add via UserPlus |
| USD P2P send | 🟢 LIVE | Debits/credits wallet via payment mock ledger |
| Crypto send (Send sheet) | 🟡 MOCK | Balance / Crypto toggle; crypto unchanged |
| Referral deep link `/r/:code` | 🟢 LIVE | Redirects to signup with ref param |
| Referral $50 bonus on qualify | 🟡 MOCK | Triggers on bank link, pay, or P2P |
| Referral banner stats | 🟢 LIVE | Pending / qualified / earned totals |
| friendships + p2p_transfers migration | 🟢 LIVE | Phase 6 SQL |

---

## Phase 5 — Payments & Double Engine

| Feature | Status | Notes |
|---------|--------|-------|
| payment_intents lifecycle | 🟡 MOCK | draft → authorized → settled |
| Pay → confirm → ledger | 🟡 MOCK | Debits via paymentMockApi |
| Double flip (bonus_only @ 40%) | 🟢 LIVE | HMAC provably-fair roll |
| Credit line waterfall on loss | 🟢 LIVE | Mirrors dubl_wallet_movement |
| dubl_obligations on credit draw | 🟡 MOCK | Dashboard + pay result disclosure |
| Double Credit Agreement gate | 🟢 LIVE | Required before first double |
| Dubls feed from payment engine | 🟢 LIVE | HMAC hash shown per row |
| payment_intents migration | 🟢 LIVE | Phase 5 SQL |

---

## Phase 4 — Profile Subpages

| Feature | Status | Notes |
|---------|--------|-------|
| Personal info (Accounts) | 🟢 LIVE | Username, display name, address → profile |
| Dubls feed | 🟢 LIVE | From payment engine; HMAC hash per row |
| Tax docs list | 🟡 MOCK | Sample docs; Supabase storage path ready |
| Settings (language/currency/payment) | 🟢 LIVE | user_app_settings table |
| Privacy toggles | 🟢 LIVE | user_privacy_settings |
| Notification toggles | 🟢 LIVE | user_notification_settings |
| Appearance | 🟢 LIVE | Phase 1 |
| Profile migrations | 🟢 LIVE | Phase 4 SQL |

---

## Phase 3 — Crypto Module

| Feature | Status | Notes |
|---------|--------|-------|
| BTC/ETH/USDT default wallets | 🟢 LIVE | Seeded via cryptoMockApi |
| DOGE/XRP/SOL add flow | 🟡 MOCK | Add Wallet modal → mock API |
| Send sheet → crypto_send_mock | 🟡 MOCK | Updates balance + activity feed |
| Receive QR modal | 🟡 MOCK | crypto_receive_address |
| Scan QR modal | 🟡 MOCK | Camera placeholder + paste → send |
| Recent activity feed | 🟢 LIVE | From crypto store transactions |
| crypto_wallets migration | 🟢 LIVE | Supabase schema ready |
| dubl-api edge fn | 🟡 MOCK | Stub deployed path; client uses local mock |

---

## Phase 2 — Dashboard & Modals

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard (balance, actions, FAQ) | 🟢 LIVE | Balance from walletStore / payment engine |
| Pay modal | 🟢 LIVE | Payment intent + double flip via paymentMockApi |
| Send money sheet | 🟢 LIVE | Balance P2P + Crypto toggle |
| Add Bank modal | 🟡 MOCK | Adds row to local store |
| Add Wallet modal | 🟡 MOCK | Asset checklist UI |
| Cards carousel | 🟢 LIVE | DUBL Visa + BTC tap card |
| Freeze / show number | 🟡 MOCK | Local state only |
| Apple Wallet pass | 🔴 STUB | Modal + MOCK badge |
| Accounts fiat table | 🟢 LIVE | Chime, Wells Fargo, PNC mock rows |
| Accounts crypto shell | 🟡 MOCK | Balance hero + activity; modals Phase 3 |
| Double toggle on dashboard | 🟢 LIVE | Gates 2× flip in Pay modal |

---

## Phase 1 — Auth & Shell

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Sign Up pages | 🟢 LIVE | Mock auth fallback when Supabase unset |
| Auth guard + guest guard | 🟢 LIVE | Redirects to / or /dashboard |
| App shell + bottom nav | 🟢 LIVE | Persistent after login |
| Swipe-back gesture | 🟢 LIVE | Left edge → history -1 |
| Modal tap-outside dismiss | 🟢 LIVE | Dirty form confirm via isDirty prop |
| Profile hub + menu rows | 🟢 LIVE | Hub tab with chevron navigation |
| Appearance settings | 🟢 LIVE | Live theme + profile sync |
| Sign out | 🟢 LIVE | Settings page |
| Dev seed login button | 🟡 MOCK | VITE_DEV_SEED_ENABLED |

---

## Phase 0 — Foundation

| Feature | Status | Notes |
|---------|--------|-------|
| Repo scaffold (Vite + React + TS) | 🟢 LIVE | Phase 0 |
| Tailwind + semantic theme tokens | 🟢 LIVE | 6 appearance presets |
| ThemeProvider + localStorage persist | 🟢 LIVE | Key: `dubl-theme` |
| UI primitives library | 🟢 LIVE | Button, Card, Modal, etc. |
| Supabase migrations (core ledger) | 🟢 LIVE | profiles, wallets, transactions |
| `dubl_wallet_movement()` RPC | 🟢 LIVE | SECURITY DEFINER, service_role only |
| Test user seed | 🟡 MOCK | `test@dubl.app` / password in seed migration |
| Email/password auth | 🟡 MOCK | Supabase auth; magic link later |
| Apple Sign In | 🔴 STUB | Button + "Coming soon" |
| Apple Wallet pass | 🔴 STUB | Modal UI only |
| Tap to Pay / NFC | 🔴 STUB | Simulated double-tap confirm |
| Plaid bank link | 🟡 MOCK | Manual routing/account entry + test flag |
| Card tokenization | 🟡 MOCK | Luhn-valid test cards table |
| ACH debit/credit | 🟡 MOCK | Delayed simulated settlement job |
| Crypto on-chain | 🟡 MOCK | Simulated addresses + fake tx hashes |
| Crypto swap | 🟡 MOCK | Mid-market rate from static table |
| Double RNG | 🟢 LIVE | Provably-fair HMAC server-side (mock seed in dev) |
| Tax PDF generation | 🟡 MOCK | Upload static sample PDFs monthly via admin |
| KYC verification | 🟡 MOCK | Admin manual approve |
| Partner odds boost | 🟢 LIVE | Admin Partners CRUD + checkout merchant match |
| Admin panel | 🟡 MOCK | Full UI at /dubl-admin-7k2m9; mock data layer |
| Edge functions | 🟡 MOCK | Rate limit + idempotency stubs Phase 8 |

---

## Default product economics (MVP)

- **Mode:** `bonus_only`
- **Win probability:** 40% (admin-configurable via `dubl_odds_config`)
- **Win payout:** +X DUBL Balance (no payment refund)
- **Loss:** debit Double Credit Line → linked bank waterfall

See [DUBL_ECONOMICS.md](./DUBL_ECONOMICS.md) for full math.

---

## Changelog

| Phase | Date | Changes |
|-------|------|---------|
| 9 | 2026-07-31 | Partner brands, checkout boost, subsidy burn report |
| 8 | 2026-07-30 | Idempotency, rate limits, RLS lockdown, smoke tests |
| 7 | 2026-07-30 | Admin panel: KPIs, ledger, collections, odds, audit |
| 6 | 2026-07-30 | P2P sends, friends, referral qualify + $50 bonus |
| 5 | 2026-07-30 | Payment intents, double flip, ledger, obligations |
| 4 | 2026-07-30 | Profile subpages wired to DB/mock API |
| 3 | 2026-07-30 | Crypto wallets, send/receive/scan modals, activity feed |
| 2 | 2026-07-30 | Dashboard, modals, cards, accounts fiat/crypto shell |
| 1 | 2026-07-30 | Auth, app shell, profile hub, appearance sync |
| 0 | 2026-07-30 | Foundation: migrations, theme, primitives, docs |
