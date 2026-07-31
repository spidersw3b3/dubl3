import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DevSeedState {
  mockBalance: number
  mockCredit: number
  isTestAccount: boolean
  setMockBalance: (n: number) => void
}

/** Local mock wallet for Phase 0 UI before Supabase auth wiring */
export const useDevSeedStore = create<DevSeedState>()(
  persist(
    (set) => ({
      mockBalance: 1234.56,
      mockCredit: 500,
      isTestAccount: true,
      setMockBalance: (n) => set({ mockBalance: n }),
    }),
    { name: 'dubl-dev-seed' },
  ),
)
