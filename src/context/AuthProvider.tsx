import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseOptional, isSupabaseConfigured } from '@/lib/supabase'
import { profileApi } from '@/lib/api/profileApi'
import { socialApi } from '@/lib/api/socialApi'
import type { AuthUser, UserProfile, AddressJson } from '@/lib/types/profile'
import type { AppearancePreset } from '@/lib/themes'
import {
  clearMockSession,
  mockDevSeedLogin,
  mockSignIn,
  mockSignUp,
  readMockSession,
  updateMockProfile,
} from '@/lib/auth/mockAuth'

interface AuthContextValue {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  isMockMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username?: string, referralCode?: string) => Promise<void>
  signOut: () => Promise<void>
  devSeedLogin: () => Promise<void>
  updateAppearance: (preset: AppearancePreset) => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseOptional()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, display_name, address_json, appearance_preset, is_test_account, referral_code, avatar_initials')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return {
    ...data,
    address_json: (data.address_json as AddressJson) ?? {},
  } as UserProfile
}

function sessionToUser(session: Session): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email ?? '',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isMockMode = !isSupabaseConfigured

  const hydrateMock = useCallback(() => {
    const session = readMockSession()
    if (session) {
      setUser(session.user)
      setProfile(session.profile)
    } else {
      setUser(null)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (isMockMode) {
      hydrateMock()
      setLoading(false)
      return
    }

    const supabase = getSupabaseOptional()
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(sessionToUser(session))
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(sessionToUser(session))
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [hydrateMock, isMockMode])

  const signIn = useCallback(async (email: string, password: string) => {
    if (isMockMode) {
      const session = mockSignIn(email, password)
      setUser(session.user)
      setProfile(session.profile)
      return
    }
    const supabase = getSupabaseOptional()!
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [isMockMode])

  const signUp = useCallback(async (email: string, password: string, username?: string, referralCode?: string) => {
    if (isMockMode) {
      const session = mockSignUp(email, password, username)
      socialApi.registerMockUser(
        {
          id: session.user.id,
          username: session.profile.username ?? email.split('@')[0],
          display_name: session.profile.display_name ?? session.profile.username ?? email.split('@')[0],
          avatar_initials: session.profile.avatar_initials ?? '??',
          is_test_account: session.profile.is_test_account,
        },
        session.profile.referral_code ?? 'REF',
      )
      if (referralCode?.trim()) {
        await socialApi.createReferralAttribution(session.user.id, referralCode.trim())
      }
      setUser(session.user)
      setProfile(session.profile)
      return
    }
    const supabase = getSupabaseOptional()!
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username } },
    })
    if (error) throw error
  }, [isMockMode])

  const signOut = useCallback(async () => {
    if (isMockMode) {
      clearMockSession()
      setUser(null)
      setProfile(null)
      return
    }
    const supabase = getSupabaseOptional()!
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [isMockMode])

  const devSeedLogin = useCallback(async () => {
    const session = mockDevSeedLogin()
    setUser(session.user)
    setProfile(session.profile)
  }, [])

  const updateAppearance = useCallback(async (preset: AppearancePreset) => {
    if (isMockMode) {
      const updated = updateMockProfile({ appearance_preset: preset })
      if (updated) setProfile(updated)
      return
    }
    if (!user) return
    const supabase = getSupabaseOptional()!
    const { error } = await supabase
      .from('profiles')
      .update({ appearance_preset: preset })
      .eq('id', user.id)
    if (error) throw error
    setProfile((prev) => (prev ? { ...prev, appearance_preset: preset } : prev))
  }, [isMockMode, user])

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    if (!user) return
    if (isMockMode) {
      const updated = updateMockProfile(patch)
      if (updated) setProfile(updated)
      await profileApi.updateProfile(user.id, patch)
      return
    }
    await profileApi.updateProfile(user.id, patch)
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [isMockMode, user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isMockMode,
      signIn,
      signUp,
      signOut,
      devSeedLogin,
      updateAppearance,
      updateProfile,
    }),
    [user, profile, loading, isMockMode, signIn, signUp, signOut, devSeedLogin, updateAppearance, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
