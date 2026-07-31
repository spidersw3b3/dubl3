import type { AppearancePreset } from '@/lib/themes'

export interface AddressJson {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface UserProfile {
  id: string
  username: string | null
  email: string | null
  display_name: string | null
  address_json: AddressJson
  appearance_preset: AppearancePreset
  is_test_account: boolean
  referral_code: string | null
  avatar_initials: string | null
}

export interface UserPrivacySettings {
  hide_personal_info: boolean
  discoverable_by_username: boolean
}

export interface UserNotificationSettings {
  push_enabled: boolean
  email_enabled: boolean
  txn_alerts: boolean
  promo_alerts: boolean
  referral_alerts: boolean
}

export interface UserAppSettings {
  language: string
  currency: string
  default_payment_method: 'balance' | 'debit' | 'credit_line'
}

export interface DublRecord {
  id: string
  merchant_name: string
  stake_amount: number
  payout_amount: number
  outcome: 'win' | 'loss'
  win_probability: number
  status: 'completed' | 'pending'
  rng_seed_hash: string | null
  created_at: string
}

export interface TaxDocument {
  id: string
  period: string
  label: string
  storage_path: string
  uploaded_at: string
}

export interface AuthUser {
  id: string
  email: string
}

export interface ProfileBundle {
  privacy: UserPrivacySettings
  notifications: UserNotificationSettings
  appSettings: UserAppSettings
  dubls: DublRecord[]
  taxDocs: TaxDocument[]
}
