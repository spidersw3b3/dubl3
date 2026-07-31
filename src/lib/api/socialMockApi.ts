import {
  getIdempotentResponse,
  requireIdempotencyKey,
  setIdempotentResponse,
} from '@/lib/idempotency/mockIdempotency'
import {
  getPaymentMockDb,
  recordWalletMovement,
} from '@/lib/api/paymentMockApi'
import { TEST_CREDENTIALS } from '@/lib/auth/mockAuth'
import type {
  DirectoryUser,
  FriendEntry,
  P2pTransfer,
  ReferralAttribution,
  ReferralQualifyResult,
  ReferralQualifyTrigger,
  ReferralStats,
  SocialBundle,
} from '@/lib/types/social'

export const REFERRAL_BONUS_USD = 50

/** Mock user directory for username search + P2P */
export const MOCK_DIRECTORY: DirectoryUser[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    username: 'testuser',
    display_name: 'Test User',
    avatar_initials: 'TU',
    is_test_account: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    username: 'janedoe',
    display_name: 'Jane Doe',
    avatar_initials: 'JD',
    is_test_account: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    username: 'mikechen',
    display_name: 'Mike Chen',
    avatar_initials: 'MC',
    is_test_account: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    username: 'sarahk',
    display_name: 'Sarah Kim',
    avatar_initials: 'SK',
    is_test_account: true,
  },
]

interface UserSocialDb {
  friendships: Map<string, FriendEntry['status']>
  transfers: P2pTransfer[]
}

const socialDb = new Map<string, UserSocialDb>()
const referralAttributions: ReferralAttribution[] = []
const referralCodeIndex = new Map<string, string>()

for (const user of MOCK_DIRECTORY) {
  referralCodeIndex.set(user.username.toUpperCase(), user.id)
}
referralCodeIndex.set('TESTREF1', MOCK_DIRECTORY[0].id)

function initSocialDb(userId: string, isTestAccount = false): UserSocialDb {
  const existing = socialDb.get(userId)
  if (existing) return existing

  const friendships = new Map<string, FriendEntry['status']>()
  if (userId === MOCK_DIRECTORY[0].id && isTestAccount) {
    friendships.set(MOCK_DIRECTORY[1].id, 'accepted')
    friendships.set(MOCK_DIRECTORY[2].id, 'accepted')
  }

  const db: UserSocialDb = {
    friendships,
    transfers: userId === MOCK_DIRECTORY[0].id && isTestAccount
      ? [
          {
            id: 'seed-p2p-1',
            sender_id: MOCK_DIRECTORY[2].id,
            receiver_id: userId,
            sender_username: 'mikechen',
            receiver_username: 'testuser',
            amount: 25,
            currency: 'USD',
            note: 'Lunch 🍕',
            status: 'completed',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
        ]
      : [],
  }
  socialDb.set(userId, db)
  return db
}

async function delay(ms = 250) {
  await new Promise((r) => setTimeout(r, ms))
}

function findUserByUsername(username: string): DirectoryUser | undefined {
  const q = username.trim().toLowerCase()
  return MOCK_DIRECTORY.find((u) => u.username.toLowerCase() === q)
}

function findUserByReferralCode(code: string): DirectoryUser | undefined {
  const referrerId = referralCodeIndex.get(code.trim().toUpperCase())
  if (!referrerId) return undefined
  return MOCK_DIRECTORY.find((u) => u.id === referrerId)
}

function getUsername(userId: string): string {
  return MOCK_DIRECTORY.find((u) => u.id === userId)?.username ?? 'unknown'
}

function buildReferralStats(userId: string, referralCode: string): ReferralStats {
  const mine = referralAttributions.filter((a) => a.referrer_id === userId)
  const asReferred = referralAttributions.find((a) => a.referred_user_id === userId)

  let totalBonus = 0
  for (const a of mine) {
    if (a.status === 'qualified' || a.status === 'paid') totalBonus += a.bonus_amount
  }
  if (asReferred && (asReferred.status === 'qualified' || asReferred.status === 'paid')) {
    totalBonus += asReferred.bonus_amount
  }

  return {
    referral_code: referralCode,
    pending_count: mine.filter((a) => a.status === 'pending').length,
    qualified_count: mine.filter((a) => a.status === 'qualified' || a.status === 'paid').length,
    total_bonus_earned: totalBonus,
    share_url: `https://dubl.app/r/${referralCode}`,
  }
}

export async function fetchSocialBundleMock(
  userId: string,
  referralCode: string,
  isTestAccount = false,
): Promise<SocialBundle> {
  await delay(100)
  const db = initSocialDb(userId, isTestAccount)

  const friends: FriendEntry[] = []
  for (const [friendId, status] of db.friendships) {
    const user = MOCK_DIRECTORY.find((u) => u.id === friendId)
    if (user) {
      friends.push({
        user,
        status,
        since: new Date(Date.now() - 7 * 86400000).toISOString(),
      })
    }
  }

  return {
    friends,
    recentTransfers: [...db.transfers].slice(0, 20),
    referralStats: buildReferralStats(userId, referralCode),
  }
}

export async function searchUsersMock(
  userId: string,
  query: string,
): Promise<DirectoryUser[]> {
  await delay(150)
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  return MOCK_DIRECTORY.filter(
    (u) =>
      u.id !== userId &&
      (u.username.toLowerCase().includes(q) ||
        u.display_name.toLowerCase().includes(q)),
  ).slice(0, 8)
}

export async function addFriendMock(
  userId: string,
  username: string,
  isTestAccount = false,
): Promise<FriendEntry> {
  await delay(200)
  const friend = findUserByUsername(username)
  if (!friend) throw new Error('User not found')
  if (friend.id === userId) throw new Error('Cannot add yourself')

  const db = initSocialDb(userId, isTestAccount)
  db.friendships.set(friend.id, 'accepted')

  return {
    user: friend,
    status: 'accepted',
    since: new Date().toISOString(),
  }
}

export async function sendP2pMock(
  senderId: string,
  params: {
    to_username: string
    amount: number
    note?: string
    idempotency_key?: string
    isTestAccount?: boolean
  },
): Promise<P2pTransfer> {
  await delay(400)

  if (params.amount <= 0) throw new Error('Amount must be greater than zero')

  const idemKey = params.idempotency_key
    ? requireIdempotencyKey(params.idempotency_key, 'send_p2p')
    : null
  if (idemKey) {
    const cached = getIdempotentResponse<P2pTransfer>('send_p2p', idemKey)
    if (cached) return cached
  }

  const recipient = findUserByUsername(params.to_username)
  if (!recipient) throw new Error('User not found')
  if (recipient.id === senderId) throw new Error('Cannot send to yourself')

  const senderDb = initSocialDb(senderId, params.isTestAccount ?? false)

  const paymentSender = getPaymentMockDb(senderId, params.isTestAccount ?? false)
  const paymentReceiver = getPaymentMockDb(recipient.id, recipient.is_test_account ?? false)

  const senderUsername = getUsername(senderId)
  const now = new Date().toISOString()

  recordWalletMovement(paymentSender, {
    type: 'p2p_send',
    direction: 'debit',
    amount: params.amount,
    reference_type: 'p2p_transfer',
    metadata: {
      to_username: recipient.username,
      note: params.note ?? null,
    },
  })

  recordWalletMovement(paymentReceiver, {
    type: 'p2p_receive',
    direction: 'credit',
    amount: params.amount,
    reference_type: 'p2p_transfer',
    metadata: {
      from_username: senderUsername,
      note: params.note ?? null,
    },
  })

  const transfer: P2pTransfer = {
    id: crypto.randomUUID(),
    sender_id: senderId,
    receiver_id: recipient.id,
    sender_username: senderUsername,
    receiver_username: recipient.username,
    amount: params.amount,
    currency: 'USD',
    note: params.note ?? null,
    status: 'completed',
    created_at: now,
    completed_at: now,
  }

  senderDb.transfers.unshift(transfer)
  const receiverSocial = initSocialDb(recipient.id, recipient.is_test_account ?? false)
  receiverSocial.transfers.unshift(transfer)

  if (idemKey) setIdempotentResponse('send_p2p', idemKey, transfer)

  return transfer
}

export async function createReferralAttributionMock(
  referredUserId: string,
  referralCode: string,
): Promise<ReferralAttribution | null> {
  await delay(100)

  const referrer = findUserByReferralCode(referralCode)
  if (!referrer) return null
  if (referrer.id === referredUserId) return null

  const existing = referralAttributions.find((a) => a.referred_user_id === referredUserId)
  if (existing) return existing

  const attribution: ReferralAttribution = {
    id: crypto.randomUUID(),
    referrer_id: referrer.id,
    referred_user_id: referredUserId,
    referral_code: referralCode.trim().toUpperCase(),
    status: 'pending',
    bonus_amount: REFERRAL_BONUS_USD,
    qualified_at: null,
    created_at: new Date().toISOString(),
  }
  referralAttributions.unshift(attribution)
  return attribution
}

function creditReferralBonus(userId: string, amount: number, isTestAccount: boolean) {
  const db = getPaymentMockDb(userId, isTestAccount)
  recordWalletMovement(db, {
    type: 'referral_bonus',
    direction: 'credit',
    amount,
    reference_type: 'referral_attribution',
    metadata: { bonus_usd: amount },
  })
}

export async function tryQualifyReferralMock(
  userId: string,
  trigger: ReferralQualifyTrigger,
  isTestAccount = false,
): Promise<ReferralQualifyResult> {
  await delay(150)

  const attribution = referralAttributions.find(
    (a) => a.referred_user_id === userId && a.status === 'pending',
  )
  if (!attribution) return { qualified: false }

  attribution.status = 'qualified'
  attribution.qualified_at = new Date().toISOString()

  const referrer = MOCK_DIRECTORY.find((u) => u.id === attribution.referrer_id)
  creditReferralBonus(attribution.referrer_id, attribution.bonus_amount, referrer?.is_test_account ?? false)
  creditReferralBonus(userId, attribution.bonus_amount, isTestAccount)

  return {
    qualified: true,
    bonus_credited: attribution.bonus_amount,
    message: `Referral qualified (${trigger}) — $${attribution.bonus_amount} credited to both accounts`,
  }
}

/** Register dynamic mock users created at signup */
export function registerMockUser(user: DirectoryUser, referralCode: string) {
  const idx = MOCK_DIRECTORY.findIndex((u) => u.id === user.id)
  if (idx === -1) MOCK_DIRECTORY.push(user)
  referralCodeIndex.set(referralCode.toUpperCase(), user.id)
}

export function resolveReferrerForSignup(referralCode: string): DirectoryUser | undefined {
  return findUserByReferralCode(referralCode)
}

export { TEST_CREDENTIALS }
