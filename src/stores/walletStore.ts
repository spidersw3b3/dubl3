import { create } from 'zustand'
import { paymentApi } from '@/lib/api/paymentApi'
import type {
  DoubleAttemptRecord,
  DublObligation,
  LedgerTransaction,
  OddsConfig,
  WalletSnapshot,
} from '@/lib/types/payments'
import { DOUBLE_CREDIT_AGREEMENT_KEY } from '@/lib/types/payments'

interface WalletState {
  wallet: WalletSnapshot
  transactions: LedgerTransaction[]
  dubls: DoubleAttemptRecord[]
  obligations: DublObligation[]
  odds: OddsConfig
  hasDoubleAgreement: boolean
  loading: boolean
  error: string | null
  hydrated: boolean
  load: (userId: string, isTestAccount?: boolean) => Promise<void>
  acceptDoubleAgreement: (userId: string) => Promise<void>
  refresh: (userId: string, isTestAccount?: boolean) => Promise<void>
}

const emptyWallet: WalletSnapshot = {
  balance_usd: 0,
  double_credit_limit: 0,
  double_credit_used: 0,
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallet: { ...emptyWallet },
  transactions: [],
  dubls: [],
  obligations: [],
  odds: paymentApi.getOddsConfig(),
  hasDoubleAgreement: false,
  loading: false,
  error: null,
  hydrated: false,

  load: async (userId, isTestAccount = false) => {
    set({ loading: true, error: null })
    try {
      const data = await paymentApi.getWalletState(userId, isTestAccount)
      set({
        wallet: data.wallet,
        transactions: data.transactions,
        dubls: data.dubls,
        obligations: data.obligations,
        hasDoubleAgreement: data.hasDoubleAgreement,
        odds: data.odds,
        loading: false,
        hydrated: true,
      })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load wallet',
        loading: false,
      })
    }
  },

  refresh: async (userId, isTestAccount = false) => {
    await get().load(userId, isTestAccount)
  },

  acceptDoubleAgreement: async (userId) => {
    await paymentApi.acceptLegal(userId, DOUBLE_CREDIT_AGREEMENT_KEY)
    set({ hasDoubleAgreement: true })
  },
}))
