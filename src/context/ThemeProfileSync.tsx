import { useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useTheme } from '@/context/ThemeProvider'

/** Hydrate theme from profile on login; localStorage wins until profile loads */
export function ThemeProfileSync() {
  const { profile } = useAuth()
  const { setPreset, preset } = useTheme()

  useEffect(() => {
    if (!profile?.appearance_preset) return
    if (profile.appearance_preset !== preset) {
      setPreset(profile.appearance_preset)
    }
  }, [profile?.appearance_preset, profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
