import { NavLink } from 'react-router'
import { Home, CreditCard, Landmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/cards', label: 'Cards', icon: CreditCard },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg-primary)] safe-bottom"
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-caption font-medium transition-colors',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
