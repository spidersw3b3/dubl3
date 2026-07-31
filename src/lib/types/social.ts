export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface DirectoryUser {
  id: string
  username: string
  display_name: string
  avatar_initials: string
  is_test_account?: boolean
}

export interface FriendEntry {
  user: DirectoryUser
  status: FriendshipStatus
  since: string
}

export interface P2pTransfer {
  id: string
  sender_id: string
  receiver_id: string
  sender_username: string
  receiver_username: string
  amount: number
  currency: string
  note: string | null
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  created_at: string
  completed_at: string | null
}

export type ReferralStatus = 'pending' | 'qualified' | 'paid'

export interface ReferralAttribution {
  id: string
  referrer_id: string
  referred_user_id: string
  referral_code: string
  status: ReferralStatus
  bonus_amount: number
  qualified_at: string | null
  created_at: string
}

export interface ReferralStats {
  referral_code: string
  pending_count: number
  qualified_count: number
  total_bonus_earned: number
  share_url: string
}

export type ReferralQualifyTrigger = 'bank_link' | 'payment' | 'p2p'

export interface ReferralQualifyResult {
  qualified: boolean
  bonus_credited?: number
  message?: string
}

export interface SocialBundle {
  friends: FriendEntry[]
  recentTransfers: P2pTransfer[]
  referralStats: ReferralStats
}
