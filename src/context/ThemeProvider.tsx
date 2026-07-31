import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyThemeTokens,
  PRESET_LABELS,
  resolvePreset,
  THEME_STORAGE_KEY,
  type AppearancePreset,
} from '@/lib/themes'

interface ThemeContextValue {
  preset: AppearancePreset
  resolvedPreset: Exclude<AppearancePreset, 'system'>
  setPreset: (preset: AppearancePreset) => void
  presetLabels: typeof PRESET_LABELS
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredPreset(): AppearancePreset {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as AppearancePreset | null
  if (stored && ['dark', 'light', 'system', 'brown', 'pink', 'teal-light'].includes(stored)) {
    return stored
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<AppearancePreset>(readStoredPreset)

  const resolvedPreset = useMemo(() => resolvePreset(preset), [preset])

  const setPreset = useCallback((next: AppearancePreset) => {
    setPresetState(next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    applyThemeTokens(preset)
  }, [preset])

  useEffect(() => {
    if (preset !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyThemeTokens('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preset])

  const value = useMemo(
    () => ({
      preset,
      resolvedPreset,
      setPreset,
      presetLabels: PRESET_LABELS,
    }),
    [preset, resolvedPreset, setPreset],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
