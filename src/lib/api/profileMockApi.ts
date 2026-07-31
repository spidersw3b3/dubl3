import type {
  DublRecord,
  ProfileBundle,
  TaxDocument,
  UserAppSettings,
  UserNotificationSettings,
  UserPrivacySettings,
  UserProfile,
  AddressJson,
} from '@/lib/types/profile'

const mockByUser = new Map<string, ProfileBundle & { profileExtras: Partial<UserProfile> }>()

const DEFAULT_PRIVACY: UserPrivacySettings = {
  hide_personal_info: false,
  discoverable_by_username: true,
}

const DEFAULT_NOTIFICATIONS: UserNotificationSettings = {
  push_enabled: true,
  email_enabled: true,
  txn_alerts: true,
  promo_alerts: false,
  referral_alerts: true,
}

const DEFAULT_APP_SETTINGS: UserAppSettings = {
  language: 'en',
  currency: 'USD',
  default_payment_method: 'balance',
}

const SEED_DUBLS: DublRecord[] = [
  {
    id: 'dubl-1',
    merchant_name: 'Target',
    stake_amount: 42.5,
    payout_amount: 42.5,
    outcome: 'win',
    win_probability: 0.4,
    status: 'completed',
    rng_seed_hash: 'a3f9c2e1mockhash001',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'dubl-2',
    merchant_name: 'Shell Gas',
    stake_amount: 35.0,
    payout_amount: 0,
    outcome: 'loss',
    win_probability: 0.4,
    status: 'completed',
    rng_seed_hash: 'b7d4f8a2mockhash002',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'dubl-3',
    merchant_name: 'Starbucks',
    stake_amount: 12.75,
    payout_amount: 12.75,
    outcome: 'win',
    win_probability: 0.4,
    status: 'completed',
    rng_seed_hash: 'c1e5a9b3mockhash003',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

const SEED_TAX_DOCS: TaxDocument[] = [
  {
    id: 'tax-2025-h1',
    period: '2025-H1',
    label: '2025 H1 Tax Summary',
    storage_path: '/assets/dubl/sample-tax-2025-h1.pdf',
    uploaded_at: new Date('2025-07-15').toISOString(),
  },
  {
    id: 'tax-2024',
    period: '2024',
    label: '2024 Annual Tax Statement',
    storage_path: '/assets/dubl/sample-tax-2024.pdf',
    uploaded_at: new Date('2025-01-31').toISOString(),
  },
]

function initUser(userId: string, isTestAccount = false) {
  const existing = mockByUser.get(userId)
  if (existing) return existing

  const data = {
    privacy: { ...DEFAULT_PRIVACY },
    notifications: { ...DEFAULT_NOTIFICATIONS },
    appSettings: { ...DEFAULT_APP_SETTINGS },
    dubls: isTestAccount ? [...SEED_DUBLS] : [],
    taxDocs: isTestAccount ? [...SEED_TAX_DOCS] : [],
    profileExtras: {
      address_json: {
        street: '123 Market St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
      } satisfies AddressJson,
    } as Partial<UserProfile>,
  }
  mockByUser.set(userId, data)
  return data
}

async function delay(ms = 200) {
  await new Promise((r) => setTimeout(r, ms))
}

export async function fetchProfileBundle(
  userId: string,
  isTestAccount = false,
): Promise<ProfileBundle> {
  await delay()
  const db = initUser(userId, isTestAccount)
  return {
    privacy: { ...db.privacy },
    notifications: { ...db.notifications },
    appSettings: { ...db.appSettings },
    dubls: [...db.dubls],
    taxDocs: [...db.taxDocs],
  }
}

export async function updateProfileMock(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<Partial<UserProfile>> {
  await delay()
  const db = initUser(userId)
  if (patch.address_json) {
    db.profileExtras.address_json = patch.address_json
  }
  if (patch.username !== undefined) db.profileExtras.username = patch.username
  if (patch.display_name !== undefined) db.profileExtras.display_name = patch.display_name
  return db.profileExtras
}

export async function updatePrivacyMock(
  userId: string,
  patch: Partial<UserPrivacySettings>,
): Promise<UserPrivacySettings> {
  await delay()
  const db = initUser(userId)
  Object.assign(db.privacy, patch)
  return { ...db.privacy }
}

export async function updateNotificationsMock(
  userId: string,
  patch: Partial<UserNotificationSettings>,
): Promise<UserNotificationSettings> {
  await delay()
  const db = initUser(userId)
  Object.assign(db.notifications, patch)
  return { ...db.notifications }
}

export async function updateAppSettingsMock(
  userId: string,
  patch: Partial<UserAppSettings>,
): Promise<UserAppSettings> {
  await delay()
  const db = initUser(userId)
  Object.assign(db.appSettings, patch)
  return { ...db.appSettings }
}

export function getMockProfileExtras(userId: string): Partial<UserProfile> {
  return initUser(userId).profileExtras
}
