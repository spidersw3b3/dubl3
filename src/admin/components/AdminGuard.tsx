import { Navigate, Outlet, useLocation } from 'react-router'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'

export function AdminGuard({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-body text-[var(--text-muted)]">Loading admin…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/dubl-admin-7k2m9/login" state={{ from: location.pathname }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export function AdminGuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-body text-[var(--text-muted)]">Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dubl-admin-7k2m9" replace />
  }

  return <>{children}</>
}
