import { PageHeader } from '@/components/PageHeader'
import { SettingsRow } from '@/components/SettingsRow'
import { Toggle } from '@/components/Toggle'
import { useAuth } from '@/context/AuthProvider'
import { useProfileHydration } from '@/hooks/useProfileHydration'
import { useProfileStore } from '@/stores/profileStore'

export function NotificationsPage() {
  const { user } = useAuth()
  useProfileHydration()
  const { notifications, saveNotifications } = useProfileStore()

  const update = async (patch: Partial<typeof notifications>) => {
    if (!user) return
    await saveNotifications(user.id, patch)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" showBack />

      <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] px-4">
        <SettingsRow label="Push notifications">
          <Toggle
            checked={notifications.push_enabled}
            onChange={(v) => update({ push_enabled: v })}
          />
        </SettingsRow>

        <SettingsRow label="Email notifications">
          <Toggle
            checked={notifications.email_enabled}
            onChange={(v) => update({ email_enabled: v })}
          />
        </SettingsRow>

        <SettingsRow label="Transaction alerts" description="Payments, sends, and deposits">
          <Toggle
            checked={notifications.txn_alerts}
            onChange={(v) => update({ txn_alerts: v })}
          />
        </SettingsRow>

        <SettingsRow label="Promotional alerts">
          <Toggle
            checked={notifications.promo_alerts}
            onChange={(v) => update({ promo_alerts: v })}
          />
        </SettingsRow>

        <SettingsRow label="Referral updates">
          <Toggle
            checked={notifications.referral_alerts}
            onChange={(v) => update({ referral_alerts: v })}
          />
        </SettingsRow>
      </div>
    </div>
  )
}
