import { Navigate, Route, Routes } from 'react-router'
import { AuthGuard, GuestGuard } from '@/components/AuthGuard'
import { AppShell } from '@/app/layouts/AppShell'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { AuthLandingPage } from '@/app/pages/AuthLandingPage'
import { LoginPage } from '@/app/pages/LoginPage'
import { SignUpPage } from '@/app/pages/SignUpPage'
import { DashboardPage } from '@/app/pages/DashboardPage'
import { CardsPage } from '@/app/pages/CardsPage'
import { AccountsPage } from '@/app/pages/AccountsPage'
import { ProfilePage } from '@/app/pages/ProfilePage'
import { AppearancePage } from '@/app/pages/profile/AppearancePage'
import { SettingsPage } from '@/app/pages/profile/SettingsPage'
import { ProfileAccountsPage } from '@/app/pages/profile/ProfileAccountsPage'
import { DublsPage } from '@/app/pages/profile/DublsPage'
import { TaxDocsPage } from '@/app/pages/profile/TaxDocsPage'
import { PrivacyPage } from '@/app/pages/profile/PrivacyPage'
import { NotificationsPage } from '@/app/pages/profile/NotificationsPage'
import { ReferralLandingPage } from '@/app/pages/ReferralLandingPage'
import { FoundationPage } from '@/app/FoundationPage'
import { PayModalPage } from '@/app/modals/PayModalPage'
import { SendSheetPage } from '@/app/modals/SendSheetPage'
import { AddBankModalPage } from '@/app/modals/AddBankModalPage'
import { AddWalletModalPage } from '@/app/modals/AddWalletModalPage'
import { ReceiveModalPage } from '@/app/modals/ReceiveModalPage'
import { ScanQrModalPage } from '@/app/modals/ScanQrModalPage'
import { AdminRoutes } from '@/admin/AdminRoutes'

const adminDisabled = import.meta.env.VITE_ADMIN_DISABLED === 'true'

function AdminDisabledPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <p className="text-title text-[var(--text-muted)]">Admin panel disabled</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
        <Route path="/" element={<AuthLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/r/:code" element={<ReferralLandingPage />} />
      </Route>

      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/pay" element={<PayModalPage />} />
        <Route path="/send" element={<SendSheetPage />} />
        <Route path="/add-bank" element={<AddBankModalPage />} />
        <Route path="/add-wallet" element={<AddWalletModalPage />} />
        <Route path="/crypto/receive" element={<ReceiveModalPage />} />
        <Route path="/crypto/scan" element={<ScanQrModalPage />} />
        <Route path="/profile" element={<ProfilePage />}>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="accounts" element={<ProfileAccountsPage />} />
          <Route path="dubls" element={<DublsPage />} />
          <Route path="tax-docs" element={<TaxDocsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="/foundation" element={<FoundationPage />} />
      </Route>

      <Route
        path="/dubl-admin-7k2m9/*"
        element={adminDisabled ? <AdminDisabledPage /> : <AdminRoutes />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
