import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  cryptoAddWalletsMock,
  cryptoReceiveAddress,
  cryptoSendMock,
  getCryptoDashboard,
  type CryptoTransaction,
  type CryptoWallet,
  type FeeTier,
} from '@/lib/api/cryptoMockApi'
import { cryptoToUsd } from '@/lib/crypto/rates'

interface CryptoState {
  wallets: CryptoWallet[]
  transactions: CryptoTransaction[]
  selectedAsset: string
  loading: boolean
  error: string | null
  hydrated: boolean
  loadDashboard: (userId: string) => Promise<void>
  setSelectedAsset: (asset: string) => void
  sendCrypto: (
    userId: string,
    params: { asset: string; to: string; amount: number; feeTier: FeeTier },
  ) => Promise<void>
  addWallets: (userId: string, assets: string[]) => Promise<void>
  getReceiveAddress: (userId: string, asset: string) => Promise<string>
  getSelectedWallet: () => CryptoWallet | undefined
  getTotalUsd: () => number
}

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set, get) => ({
      wallets: [],
      transactions: [],
      selectedAsset: 'BTC',
      loading: false,
      error: null,
      hydrated: false,

      loadDashboard: async (userId) => {
        set({ loading: true, error: null })
        try {
          const data = await getCryptoDashboard(userId)
          set({
            wallets: data.wallets,
            transactions: data.transactions,
            loading: false,
            hydrated: true,
          })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : 'Failed to load crypto',
            loading: false,
          })
        }
      },

      setSelectedAsset: (selectedAsset) => set({ selectedAsset }),

      sendCrypto: async (userId, params) => {
        set({ loading: true, error: null })
        try {
          await cryptoSendMock(userId, params)
          const data = await getCryptoDashboard(userId)
          set({ wallets: data.wallets, transactions: data.transactions, loading: false })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : 'Send failed',
            loading: false,
          })
          throw e
        }
      },

      addWallets: async (userId, assets) => {
        set({ loading: true, error: null })
        try {
          await cryptoAddWalletsMock(userId, assets)
          const data = await getCryptoDashboard(userId)
          set({ wallets: data.wallets, transactions: data.transactions, loading: false })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : 'Failed to add wallets',
            loading: false,
          })
          throw e
        }
      },

      getReceiveAddress: async (userId, asset) => {
        const result = await cryptoReceiveAddress(userId, asset)
        return result.address
      },

      getSelectedWallet: () => {
        const { wallets, selectedAsset } = get()
        return wallets.find((w) => w.asset === selectedAsset) ?? wallets.find((w) => w.isDefault)
      },

      getTotalUsd: () => {
        return get().wallets.reduce((sum, w) => sum + cryptoToUsd(w.balance, w.asset), 0)
      },
    }),
    {
      name: 'dubl-crypto',
      partialize: (s) => ({
        selectedAsset: s.selectedAsset,
      }),
    },
  ),
)
