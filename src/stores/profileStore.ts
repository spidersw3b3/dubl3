import { create } from 'zustand'
import { profileApi } from '@/lib/api/profileApi'
import type {
  DublRecord,
  ProfileBundle,
  TaxDocument,
  UserAppSettings,
  UserNotificationSettings,
  UserPrivacySettings,
} from '@/lib/types/profile'

interface ProfileState extends ProfileBundle {
  loading: boolean
  error: string | null
  hydrated: boolean
  load: (userId: string, isTestAccount?: boolean) => Promise<void>
  savePrivacy: (userId: string, patch: Partial<UserPrivacySettings>) => Promise<void>
  saveNotifications: (userId: string, patch: Partial<UserNotificationSettings>) => Promise<void>
  saveAppSettings: (userId: string, patch: Partial<UserAppSettings>) => Promise<void>
}

const emptyBundle: ProfileBundle = {
  privacy: {
    hide_personal_info: false,
    discoverable_by_username: true,
  },
  notifications: {
    push_enabled: true,
    email_enabled: true,
    txn_alerts: true,
    promo_alerts: false,
    referral_alerts: true,
  },
  appSettings: {
    language: 'en',
    currency: 'USD',
    default_payment_method: 'balance',
  },
  dubls: [],
  taxDocs: [],
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  ...emptyBundle,
  loading: false,
  error: null,
  hydrated: false,

  load: async (userId, isTestAccount = false) => {
    set({ loading: true, error: null })
    try {
      const bundle = await profileApi.getBundle(userId, isTestAccount)
      set({ ...bundle, loading: false, hydrated: true })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load profile',
        loading: false,
      })
    }
  },

  savePrivacy: async (userId, patch) => {
    await profileApi.updatePrivacy(userId, patch)
    set({ privacy: { ...get().privacy, ...patch } })
  },

  saveNotifications: async (userId, patch) => {
    await profileApi.updateNotifications(userId, patch)
    set({ notifications: { ...get().notifications, ...patch } })
  },

  saveAppSettings: async (userId, patch) => {
    await profileApi.updateAppSettings(userId, patch)
    set({ appSettings: { ...get().appSettings, ...patch } })
  },
}))

export type { DublRecord, TaxDocument }
