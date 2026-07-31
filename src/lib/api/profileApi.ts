import { isSupabaseConfigured, getSupabaseOptional } from '@/lib/supabase'
import {
  fetchProfileBundle,
  updateAppSettingsMock,
  updateNotificationsMock,
  updatePrivacyMock,
  updateProfileMock,
  getMockProfileExtras,
} from '@/lib/api/profileMockApi'
import type {
  ProfileBundle,
  UserAppSettings,
  UserNotificationSettings,
  UserPrivacySettings,
  UserProfile,
} from '@/lib/types/profile'

export const profileApi = {
  useMock: !isSupabaseConfigured,

  async getBundle(userId: string, isTestAccount = false): Promise<ProfileBundle> {
    if (this.useMock) return fetchProfileBundle(userId, isTestAccount)

    const supabase = getSupabaseOptional()!
    const [privacy, notifications, appSettings, dubls, taxDocs] = await Promise.all([
      supabase.from('user_privacy_settings').select('*').eq('user_id', userId).single(),
      supabase.from('user_notification_settings').select('*').eq('user_id', userId).single(),
      supabase.from('user_app_settings').select('*').eq('user_id', userId).single(),
      supabase.from('double_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('tax_documents').select('*').eq('user_id', userId).order('period', { ascending: false }),
    ])

    return {
      privacy: {
        hide_personal_info: privacy.data?.hide_personal_info ?? false,
        discoverable_by_username: privacy.data?.discoverable_by_username ?? true,
      },
      notifications: {
        push_enabled: notifications.data?.push_enabled ?? true,
        email_enabled: notifications.data?.email_enabled ?? true,
        txn_alerts: notifications.data?.txn_alerts ?? true,
        promo_alerts: notifications.data?.promo_alerts ?? false,
        referral_alerts: notifications.data?.referral_alerts ?? true,
      },
      appSettings: {
        language: appSettings.data?.language ?? 'en',
        currency: appSettings.data?.currency ?? 'USD',
        default_payment_method: appSettings.data?.default_payment_method ?? 'balance',
      },
      dubls: (dubls.data ?? []).map((d) => ({
        id: d.id,
        merchant_name: (d.metadata as { merchant_name?: string })?.merchant_name ?? 'Merchant',
        stake_amount: Number(d.stake_amount),
        payout_amount: Number(d.payout_amount),
        outcome: d.outcome as 'win' | 'loss',
        win_probability: Number(d.win_probability),
        status: d.status as 'completed' | 'pending',
        rng_seed_hash: d.rng_seed_hash,
        created_at: d.created_at,
      })),
      taxDocs: (taxDocs.data ?? []).map((t) => ({
        id: t.id,
        period: t.period,
        label: t.label,
        storage_path: t.storage_path,
        uploaded_at: t.created_at,
      })),
    }
  },

  async updateProfile(userId: string, patch: Partial<UserProfile>) {
    if (this.useMock) return updateProfileMock(userId, patch)

    const supabase = getSupabaseOptional()!
    const { error } = await supabase
      .from('profiles')
      .update({
        username: patch.username,
        display_name: patch.display_name,
        address_json: patch.address_json,
        avatar_initials: patch.avatar_initials,
      })
      .eq('id', userId)
    if (error) throw error
  },

  async updatePrivacy(userId: string, patch: Partial<UserPrivacySettings>) {
    if (this.useMock) return updatePrivacyMock(userId, patch)
    const supabase = getSupabaseOptional()!
    const { error } = await supabase.from('user_privacy_settings').update(patch).eq('user_id', userId)
    if (error) throw error
    return patch as UserPrivacySettings
  },

  async updateNotifications(userId: string, patch: Partial<UserNotificationSettings>) {
    if (this.useMock) return updateNotificationsMock(userId, patch)
    const supabase = getSupabaseOptional()!
    const { error } = await supabase.from('user_notification_settings').update(patch).eq('user_id', userId)
    if (error) throw error
    return patch as UserNotificationSettings
  },

  async updateAppSettings(userId: string, patch: Partial<UserAppSettings>) {
    if (this.useMock) return updateAppSettingsMock(userId, patch)
    const supabase = getSupabaseOptional()!
    const { error } = await supabase.from('user_app_settings').update(patch).eq('user_id', userId)
    if (error) throw error
    return patch as UserAppSettings
  },

  getMockExtras(userId: string) {
    return getMockProfileExtras(userId)
  },
}
