# DUBL Architecture

**Author:** spidersw3b3  
**Stack:** Vite + React 18 + TypeScript + React Router 7 + Tailwind + Supabase

---

## Repository layout

```
dubl/
├── docs/                    # Manifest, economics, compliance
├── src/
│   ├── app/                 # Player routes (Phase 1+)
│   ├── admin/               # Obfuscated admin (/dubl-admin-7k2m9)
│   ├── components/          # Shared UI primitives
│   ├── context/             # ThemeProvider, AuthProvider
│   ├── lib/                 # API clients, formatters, supabase
│   ├── hooks/
│   └── stores/              # Zustand client state
├── supabase/
│   ├── migrations/          # Postgres schema + RPC
│   └── functions/           # Edge APIs (dubl-api, admin-api)
└── public/assets/dubl/
```

---

## Money flow (ledger-first)

All balance mutations go through **`dubl_wallet_movement()`** RPC — never direct client writes to `wallets` or `transactions`.

```
Client → Edge Function → idempotency check → dubl_wallet_movement() → response
```

### Tables (Phase 0)

| Table | Purpose |
|-------|---------|
| `profiles` | User identity, appearance, test flag |
| `wallets` | USD balance + double credit line |
| `transactions` | Append-only ledger |
| `idempotency_keys` | Dedup money operations |

### RLS

- Players: **SELECT own rows** on wallets/transactions
- **NO direct INSERT/UPDATE** on money tables from client
- Mutations via Edge Functions + service_role RPC only

---

## Theme system

Semantic CSS variables consumed by all components — never hardcode hex in JSX.

Presets: Dark (default), Light, System, Brown/Champagne, Pink, Teal Light.

`ThemeProvider` persists to `localStorage` (`dubl-theme`) and syncs to `profiles.appearance_preset`.

---

## Navigation (Phase 1+)

Bottom nav: Home | Cards | Accounts | Profile

Overlay routes: Pay, Send, Add Bank, Add Wallet, Crypto modals.

---

## Admin (Phase 7)

- Base path: `/dubl-admin-7k2m9/*`
- Kill switch: `VITE_ADMIN_DISABLED`
- JWT auth + action-registry edge API
- Every mutation → confirm dialog + reason → `admin_audit_log`

---

## Security checklist

- [x] No service role key in client
- [x] Money via RPC only (Phase 0 schema)
- [ ] Edge function idempotency (Phase 8)
- [ ] PAN never stored — last4 only (Phase 2)
- [ ] Double Credit Agreement gate (Phase 5)
