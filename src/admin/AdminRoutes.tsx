import { Navigate, Route, Routes } from 'react-router'
import { AdminAuthProvider } from '@/admin/context/AdminAuthProvider'
import { AdminGuard, AdminGuestGuard } from '@/admin/components/AdminGuard'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage'
import { AdminCommandPage } from '@/admin/pages/AdminCommandPage'
import { AdminUsersPage } from '@/admin/pages/AdminUsersPage'
import { AdminTransactionsPage } from '@/admin/pages/AdminTransactionsPage'
import { AdminDoubleEnginePage } from '@/admin/pages/AdminDoubleEnginePage'
import { AdminPartnersPage } from '@/admin/pages/AdminPartnersPage'
import { AdminCollectionsPage } from '@/admin/pages/AdminCollectionsPage'
import { AdminAuditLogPage } from '@/admin/pages/AdminAuditLogPage'

const adminDisabled = import.meta.env.VITE_ADMIN_DISABLED === 'true'

export function AdminRoutes() {
  if (adminDisabled) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-title text-[var(--text-muted)]">Admin panel disabled (VITE_ADMIN_DISABLED)</p>
      </div>
    )
  }

  return (
    <AdminAuthProvider>
      <Routes>
        <Route element={<AdminGuestGuard><AdminLoginPage /></AdminGuestGuard>} path="login" />
        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminCommandPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="double-engine" element={<AdminDoubleEnginePage />} />
          <Route path="partners" element={<AdminPartnersPage />} />
          <Route path="collections" element={<AdminCollectionsPage />} />
          <Route path="audit" element={<AdminAuditLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dubl-admin-7k2m9" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
