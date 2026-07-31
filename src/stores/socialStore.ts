import { create } from 'zustand'
import { socialApi } from '@/lib/api/socialApi'
import type {
  DirectoryUser,
  FriendEntry,
  P2pTransfer,
  ReferralQualifyResult,
  ReferralStats,
} from '@/lib/types/social'

interface SocialState {
  friends: FriendEntry[]
  recentTransfers: P2pTransfer[]
  referralStats: ReferralStats | null
  searchResults: DirectoryUser[]
  loading: boolean
  sending: boolean
  error: string | null
  hydrated: boolean
  load: (userId: string, referralCode: string, isTestAccount?: boolean) => Promise<void>
  refresh: (userId: string, referralCode: string, isTestAccount?: boolean) => Promise<void>
  searchUsers: (userId: string, query: string) => Promise<void>
  clearSearch: () => void
  addFriend: (userId: string, username: string, isTestAccount?: boolean) => Promise<void>
  sendP2p: (
    senderId: string,
    params: {
      to_username: string
      amount: number
      note?: string
      idempotency_key?: string
      isTestAccount?: boolean
    },
  ) => Promise<P2pTransfer>
  tryQualifyReferral: (
    userId: string,
    trigger: 'bank_link' | 'payment' | 'p2p',
    isTestAccount?: boolean,
  ) => Promise<ReferralQualifyResult>
}

const emptyReferralStats = (code: string): ReferralStats => ({
  referral_code: code,
  pending_count: 0,
  qualified_count: 0,
  total_bonus_earned: 0,
  share_url: `https://dubl.app/r/${code}`,
})

export const useSocialStore = create<SocialState>()((set, get) => ({
  friends: [],
  recentTransfers: [],
  referralStats: null,
  searchResults: [],
  loading: false,
  sending: false,
  error: null,
  hydrated: false,

  load: async (userId, referralCode, isTestAccount = false) => {
    set({ loading: true, error: null })
    try {
      const bundle = await socialApi.getBundle(userId, referralCode, isTestAccount)
      set({
        friends: bundle.friends,
        recentTransfers: bundle.recentTransfers,
        referralStats: bundle.referralStats,
        loading: false,
        hydrated: true,
      })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load social data',
        referralStats: emptyReferralStats(referralCode),
        loading: false,
      })
    }
  },

  refresh: async (userId, referralCode, isTestAccount = false) => {
    await get().load(userId, referralCode, isTestAccount)
  },

  searchUsers: async (userId, query) => {
    if (query.trim().length < 2) {
      set({ searchResults: [] })
      return
    }
    const results = await socialApi.searchUsers(userId, query)
    set({ searchResults: results })
  },

  clearSearch: () => set({ searchResults: [] }),

  addFriend: async (userId, username, isTestAccount = false) => {
    set({ error: null })
    try {
      const entry = await socialApi.addFriend(userId, username, isTestAccount)
      set((s) => ({
        friends: s.friends.some((f) => f.user.id === entry.user.id)
          ? s.friends
          : [...s.friends, entry],
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not add friend' })
      throw e
    }
  },

  sendP2p: async (senderId, params) => {
    set({ sending: true, error: null })
    try {
      const transfer = await socialApi.sendP2p(senderId, params)
      set((s) => ({
        recentTransfers: [transfer, ...s.recentTransfers],
        sending: false,
      }))
      return transfer
    } catch (e) {
      set({
        sending: false,
        error: e instanceof Error ? e.message : 'Send failed',
      })
      throw e
    }
  },

  tryQualifyReferral: async (userId, trigger, isTestAccount = false) => {
    const result = await socialApi.tryQualifyReferral(userId, trigger, isTestAccount)
    if (result.qualified && get().referralStats) {
      set((s) => ({
        referralStats: s.referralStats
          ? {
              ...s.referralStats,
              qualified_count: s.referralStats.qualified_count + 1,
              pending_count: Math.max(0, s.referralStats.pending_count - 1),
              total_bonus_earned: s.referralStats.total_bonus_earned + (result.bonus_credited ?? 0),
            }
          : s.referralStats,
      }))
    }
    return result
  },
}))
