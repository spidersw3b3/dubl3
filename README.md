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

Open [http://localhost:5173/foundation](http://localhost:5173/foundation) for the Phase 0 component showcase.

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
| 1 — Auth & Shell | Pending |
| 2 — Dashboard & Modals | Pending |

See [docs/MOCK_MANIFEST.md](./docs/MOCK_MANIFEST.md) for feature status tags.

## Theme presets

Dark (default), Light, System, Brown/Champagne, Pink, Teal Light — see [src/lib/themes.ts](./src/lib/themes.ts).

## Admin

Route: `/dubl-admin-7k2m9/*` (Phase 7). Kill switch: `VITE_ADMIN_DISABLED=true`.

## Docs

- [MOCK_MANIFEST.md](./docs/MOCK_MANIFEST.md)
- [DUBL_ECONOMICS.md](./docs/DUBL_ECONOMICS.md)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
