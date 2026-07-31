import { Navigate, Route, Routes } from 'react-router'
import { FoundationPage } from '@/app/FoundationPage'

/** Placeholder routes — wired in Phase 1+ */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <p className="text-title text-[var(--text-muted)]">{title} — Phase 1+</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Login / Sign Up" />} />
      <Route path="/foundation" element={<FoundationPage />} />
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route path="/cards" element={<Placeholder title="Cards" />} />
      <Route path="/accounts" element={<Placeholder title="Accounts" />} />
      <Route path="/profile" element={<Placeholder title="Profile" />} />
      <Route path="/dubl-admin-7k2m9" element={<Placeholder title="Admin Panel" />} />
      <Route path="*" element={<Navigate to="/foundation" replace />} />
    </Routes>
  )
}
