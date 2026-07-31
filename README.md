# DUBL Fintech MVP

**Author:** spidersw3b3

Mock-but-functional fintech MVP combining Chime-style fiat banking, Cake Wallet-style crypto, Venmo-style P2P, and a proprietary **Double-or-Nothing Pay** mechanic.

## Stack

- Vite + React 18 + TypeScript + React Router 7
- Tailwind CSS 4 + semantic theme tokens
- Supabase (Postgres, Auth, Edge Functions)
- Zustand + TanStack Query

## Quick start

```bash
npm install
cp .env.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Smoke tests: `npm run test:smoke`

Open [http://localhost:5173](http://localhost:5173) — use **Dev: Sign in as test@dubl.app** or `test@dubl.app` / `TestDubl123!`

Legacy component showcase: [http://localhost:5173/foundation](http://localhost:5173/foundation)

## Supabase migrations

Apply migrations in order:

```bash
supabase db push
# or run SQL files in supabase/migrations/ via dashboard
```

### Test user seed

After creating auth user `test@dubl.app` / `TestDubl123!`:

```sql
SELECT public.seed_test_account('USER_UUID_HERE');
```

## Phase status

| Phase | Status |
|-------|--------|
| 0 — Foundation | ✅ Complete |
| 1 — Auth & Shell | ✅ Complete |
| 2 — Dashboard & Modals | ✅ Complete |
| 3 — Crypto Module | ✅ Complete |
| 4 — Profile Subpages | ✅ Complete |
| 5 — Payments & Double Engine | ✅ Complete |
| 6 — P2P & Referrals | ✅ Complete |
| 7 — Admin Panel | ✅ Complete |
| 8 — Hardening | ✅ Complete |
| 9 — Partner Boosts | ✅ Complete |

See [docs/MOCK_MANIFEST.md](./docs/MOCK_MANIFEST.md) for feature status tags. **MVP phases 0–9 complete.**

## Theme presets

Dark (default), Light, System, Brown/Champagne, Pink, Teal Light — see [src/lib/themes.ts](./src/lib/themes.ts).

## Admin

Route: `/dubl-admin-7k2m9/*` — dev login `admin@dubl.app` / `AdminDubl123!`. Kill switch: `VITE_ADMIN_DISABLED=true`.

## Docs

- [MOCK_MANIFEST.md](./docs/MOCK_MANIFEST.md)
- [DUBL_ECONOMICS.md](./docs/DUBL_ECONOMICS.md)
- [RLS_AUDIT.md](./docs/RLS_AUDIT.md)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
