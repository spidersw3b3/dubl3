import { PageHeader } from '@/components/PageHeader'
import { SettingsRow } from '@/components/SettingsRow'
import { Toggle } from '@/components/Toggle'
import { useAuth } from '@/context/AuthProvider'
import { useProfileHydration } from '@/hooks/useProfileHydration'
import { useProfileStore } from '@/stores/profileStore'

export function PrivacyPage() {
  const { user } = useAuth()
  useProfileHydration()
  const { privacy, savePrivacy } = useProfileStore()

  const update = async (patch: Partial<typeof privacy>) => {
    if (!user) return
    await savePrivacy(user.id, patch)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Privacy" showBack />

      <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] px-4">
        <SettingsRow
          label="Hide personal info"
          description="Others won't see your full name on sends"
        >
          <Toggle
            checked={privacy.hide_personal_info}
            onChange={(v) => update({ hide_personal_info: v })}
          />
        </SettingsRow>

        <SettingsRow
          label="Discoverable by username"
          description="Allow friends to find you by @username"
        >
          <Toggle
            checked={privacy.discoverable_by_username}
            onChange={(v) => update({ discoverable_by_username: v })}
          />
        </SettingsRow>
      </div>
    </div>
  )
}
