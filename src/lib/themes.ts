export type AppearancePreset =
  | 'dark'
  | 'light'
  | 'system'
  | 'brown'
  | 'pink'
  | 'teal-light'

export interface ThemeTokens {
  '--bg-primary': string
  '--bg-surface': string
  '--card-bg': string
  '--text-primary': string
  '--text-muted': string
  '--accent': string
  '--accent-hover': string
  '--border': string
  '--success': string
  '--warning': string
  '--danger': string
  '--overlay': string
}

export const THEME_STORAGE_KEY = 'dubl-theme'

/** Resolved preset labels for Appearance picker */
export const PRESET_LABELS: Record<Exclude<AppearancePreset, 'system'>, string> = {
  dark: 'Dark',
  light: 'Light',
  brown: 'Brown / Champagne',
  pink: 'Pink',
  'teal-light': 'Teal Light',
}

/**
 * Semantic theme tokens — never hardcode hex in components.
 * Brown/Champagne, Pink, Teal Light mappings align with StormBet appearance presets.
 */
export const THEME_PRESETS: Record<Exclude<AppearancePreset, 'system'>, ThemeTokens> = {
  dark: {
    '--bg-primary': '#0B3D3A',
    '--bg-surface': '#0F4C49',
    '--card-bg': '#123E3B',
    '--text-primary': '#FFFFFF',
    '--text-muted': '#94A3BB',
    '--accent': '#14B8A6',
    '--accent-hover': '#2DD4BF',
    '--border': '#1A5C5B',
    '--success': '#22C55E',
    '--warning': '#F59E0B',
    '--danger': '#EF4444',
    '--overlay': 'rgba(0, 0, 0, 0.6)',
  },
  light: {
    '--bg-primary': '#FFFFFF',
    '--bg-surface': '#F8FAFA',
    '--card-bg': '#FFFFFF',
    '--text-primary': '#0B3D3A',
    '--text-muted': '#64748B',
    '--accent': '#0F766E',
    '--accent-hover': '#0D9488',
    '--border': '#E2E8F0',
    '--success': '#16A34A',
    '--warning': '#D97706',
    '--danger': '#DC2626',
    '--overlay': 'rgba(15, 61, 58, 0.4)',
  },
  /** StormBet Brown/Champagne — warm espresso + champagne gold accent */
  brown: {
    '--bg-primary': '#1A1410',
    '--bg-surface': '#2A2218',
    '--card-bg': '#332A1F',
    '--text-primary': '#F5F0E8',
    '--text-muted': '#A89880',
    '--accent': '#C9A962',
    '--accent-hover': '#D4BC7D',
    '--border': '#4A3D2E',
    '--success': '#6B9E6B',
    '--warning': '#D4A054',
    '--danger': '#C45C5C',
    '--overlay': 'rgba(26, 20, 16, 0.7)',
  },
  /** StormBet Pink — deep rose noir + hot pink accent */
  pink: {
    '--bg-primary': '#1A0F14',
    '--bg-surface': '#2A1520',
    '--card-bg': '#351A28',
    '--text-primary': '#FFF0F5',
    '--text-muted': '#C4A0B0',
    '--accent': '#EC4899',
    '--accent-hover': '#F472B6',
    '--border': '#4A2540',
    '--success': '#34D399',
    '--warning': '#FBBF24',
    '--danger': '#F87171',
    '--overlay': 'rgba(26, 15, 20, 0.7)',
  },
  /** StormBet Teal Light — airy mint surface + deep teal text */
  'teal-light': {
    '--bg-primary': '#E6F7F5',
    '--bg-surface': '#FFFFFF',
    '--card-bg': '#F0FAF9',
    '--text-primary': '#0B3D3A',
    '--text-muted': '#5B8A87',
    '--accent': '#0D9488',
    '--accent-hover': '#14B8A6',
    '--border': '#B8E0DC',
    '--success': '#059669',
    '--warning': '#D97706',
    '--danger': '#DC2626',
    '--overlay': 'rgba(11, 61, 58, 0.35)',
  },
}

export function resolvePreset(preset: AppearancePreset): Exclude<AppearancePreset, 'system'> {
  if (preset === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  }
  return preset
}

export function applyThemeTokens(preset: AppearancePreset): void {
  const resolved = resolvePreset(preset)
  const tokens = THEME_PRESETS[resolved]
  const root = document.documentElement

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  root.dataset.theme = resolved
}

export function getPresetSwatch(preset: Exclude<AppearancePreset, 'system'>): string {
  return THEME_PRESETS[preset]['--accent']
}
