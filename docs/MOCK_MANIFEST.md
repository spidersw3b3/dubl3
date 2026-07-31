# DUBL — Mock vs Production Manifest

**Author:** spidersw3b3  
**Last updated:** Phase 0 foundation

Every feature in the DUBL MVP is tagged with one of three statuses:

| Tag | Meaning |
|-----|---------|
| 🟢 **LIVE** | Real wiring, production-ready path |
| 🟡 **MOCK** | Functional UI + local/DB simulation |
| 🔴 **STUB** | UI only, disabled with tooltip |

Test accounts see a visible 🟡 badge on mock features (dev + `is_test_account` users).

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
| Partner odds boost | 🟢 LIVE | Admin-configurable (Phase 9) |
| Admin panel | 🔴 STUB | Phase 7 — route stub only |
| Edge functions | 🔴 STUB | Directory scaffold; Phase 5+ |

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
| 0 | 2026-07-30 | Foundation: migrations, theme, primitives, docs |
