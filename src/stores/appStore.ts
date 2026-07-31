import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ADDABLE_WALLETS, MOCK_BANKS, MOCK_CARDS, type LinkedBank, type PaymentCard } from '@/lib/mock/seedData'

interface AppState {
  doubleEnabled: boolean
  payAmount: number
  accountsMode: 'fiat' | 'crypto'
  banks: LinkedBank[]
  cards: PaymentCard[]
  addedWallets: string[]
  cardNumberVisible: boolean
  toggleDouble: () => void
  setPayAmount: (n: number) => void
  setAccountsMode: (mode: 'fiat' | 'crypto') => void
  addBank: (bank: Omit<LinkedBank, 'id' | 'status'>) => void
  toggleCardFrozen: (cardId: string) => void
  setCardNumberVisible: (v: boolean) => void
  addWallets: (codes: string[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      doubleEnabled: false,
      payAmount: 200,
      accountsMode: 'fiat',
      banks: MOCK_BANKS,
      cards: MOCK_CARDS,
      addedWallets: [],
      cardNumberVisible: false,
      toggleDouble: () => set((s) => ({ doubleEnabled: !s.doubleEnabled })),
      setPayAmount: (payAmount) => set({ payAmount }),
      setAccountsMode: (accountsMode) => set({ accountsMode }),
      addBank: (bank) =>
        set((s) => ({
          banks: [
            ...s.banks,
            {
              ...bank,
              id: crypto.randomUUID(),
              status: 'connected' as const,
            },
          ],
        })),
      toggleCardFrozen: (cardId) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c,
          ),
        })),
      setCardNumberVisible: (cardNumberVisible) => set({ cardNumberVisible }),
      addWallets: (codes) =>
        set((s) => ({
          addedWallets: [...new Set([...s.addedWallets, ...codes])],
        })),
    }),
    { name: 'dubl-app' },
  ),
)

export function getTotalBankCredit(): number {
  return useAppStore.getState().banks.reduce((sum, b) => sum + b.limit, 0)
}

export { ADDABLE_WALLETS }
