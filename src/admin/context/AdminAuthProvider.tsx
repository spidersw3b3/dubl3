import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminApi } from '@/lib/api/adminApi'
import type { AdminSession, AdminUser } from '@/lib/types/admin'

interface AdminAuthContextValue {
  session: AdminSession | null
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSession(adminApi.readSession())
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const next = await adminApi.login(email, password)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    adminApi.clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      login,
      logout,
    }),
    [session, loading, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
