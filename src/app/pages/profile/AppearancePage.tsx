import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Toast } from '@/components/Toast'
import { useAuth } from '@/context/AuthProvider'
import { useTheme } from '@/context/ThemeProvider'
import {
  getPresetSwatch,
  PRESET_LABELS,
  type AppearancePreset,
} from '@/lib/themes'
import { cn } from '@/lib/utils'

const PRESETS: AppearancePreset[] = ['dark', 'light', 'system', 'brown', 'pink', 'teal-light']

export function AppearancePage() {
  const { preset, setPreset } = useTheme()
  const { updateAppearance } = useAuth()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  const selectPreset = async (next: AppearancePreset) => {
    setPreset(next)
    setSaving(true)
    try {
      await updateAppearance(next)
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Appearance" showBack />

      <p className="text-body text-[var(--text-muted)]">
        Choose a theme. Changes apply instantly across the app.
      </p>

      <div className="space-y-2">
        {PRESETS.map((p) => {
          const label = p === 'system' ? 'System' : PRESET_LABELS[p]
          const active = preset === p
          const swatch = p === 'system' ? undefined : getPresetSwatch(p)

          return (
            <button
              key={p}
              type="button"
              disabled={saving}
              onClick={() => selectPreset(p)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border px-4 py-3 transition-colors',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--bg-surface)]',
              )}
            >
              {swatch ? (
                <span
                  className="h-8 w-8 shrink-0 rounded-full border border-[var(--border)]"
                  style={{ backgroundColor: swatch }}
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-caption">
                  OS
                </span>
              )}
              <span className="flex-1 text-left text-body font-semibold">{label}</span>
              {active && <Check className="h-5 w-5 text-[var(--accent)]" />}
            </button>
          )
        })}
      </div>

      <Toast message="Theme saved" variant="success" visible={toast} />
    </div>
  )
}
