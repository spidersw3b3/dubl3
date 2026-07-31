import { NavLink, Outlet } from 'react-router'
import {
  ClipboardList,
  Dices,
  LayoutDashboard,
  LogOut,
  Receipt,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dubl-admin-7k2m9', end: true, label: 'Command', icon: LayoutDashboard },
  { to: '/dubl-admin-7k2m9/users', label: 'Users', icon: Users },
  { to: '/dubl-admin-7k2m9/transactions', label: 'Transactions', icon: Receipt },
  { to: '/dubl-admin-7k2m9/double-engine', label: 'Double Engine', icon: Dices },
  { to: '/dubl-admin-7k2m9/partners', label: 'Partners', icon: Sparkles },
  { to: '/dubl-admin-7k2m9/collections', label: 'Collections', icon: ClipboardList },
  { to: '/dubl-admin-7k2m9/audit', label: 'Audit Log', icon: Shield },
]

export function AdminLayout() {
  const { user, logout } = useAdminAuth()

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)] md:flex md:flex-col">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <p className="text-caption text-[var(--text-muted)]">DUBL Admin</p>
          <p className="text-body font-bold">7k2m9</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-body transition-colors',
                  isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <p className="text-caption text-[var(--text-muted)] truncate">{user?.email}</p>
          <p className="text-caption text-[var(--accent)] mb-2">{user?.role}</p>
          <Button size="sm" variant="ghost" fullWidth onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:hidden">
          <p className="font-bold">DUBL Admin</p>
          <Button size="sm" variant="ghost" onClick={logout}>Sign out</Button>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
