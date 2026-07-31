import { isSupabaseConfigured } from '@/lib/supabase'
import {
  addFriendMock,
  createReferralAttributionMock,
  fetchSocialBundleMock,
  registerMockUser,
  searchUsersMock,
  sendP2pMock,
  tryQualifyReferralMock,
} from '@/lib/api/socialMockApi'
import type { ReferralQualifyTrigger } from '@/lib/types/social'

export const socialApi = {
  useMock: !isSupabaseConfigured,

  getBundle(userId: string, referralCode: string, isTestAccount?: boolean) {
    if (this.useMock) return fetchSocialBundleMock(userId, referralCode, isTestAccount)
    throw new Error('Supabase social API not wired — use mock mode')
  },

  searchUsers(userId: string, query: string) {
    if (this.useMock) return searchUsersMock(userId, query)
    throw new Error('Supabase social API not wired')
  },

  addFriend(userId: string, username: string, isTestAccount?: boolean) {
    if (this.useMock) return addFriendMock(userId, username, isTestAccount)
    throw new Error('Supabase social API not wired')
  },

  sendP2p(
    senderId: string,
    params: Parameters<typeof sendP2pMock>[1],
  ) {
    if (this.useMock) return sendP2pMock(senderId, params)
    throw new Error('Supabase social API not wired')
  },

  createReferralAttribution(referredUserId: string, referralCode: string) {
    if (this.useMock) return createReferralAttributionMock(referredUserId, referralCode)
    throw new Error('Supabase social API not wired')
  },

  tryQualifyReferral(
    userId: string,
    trigger: ReferralQualifyTrigger,
    isTestAccount?: boolean,
  ) {
    if (this.useMock) return tryQualifyReferralMock(userId, trigger, isTestAccount)
    throw new Error('Supabase social API not wired')
  },

  registerMockUser(user: Parameters<typeof registerMockUser>[0], referralCode: string) {
    if (this.useMock) registerMockUser(user, referralCode)
  },
}
