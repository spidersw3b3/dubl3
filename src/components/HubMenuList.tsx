import { type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export interface HubMenuItem {
  to: string
  icon: ReactNode
  title: string
  subtitle: string
}

export interface HubMenuListProps {
  items: HubMenuItem[]
  className?: string
}

export function HubMenuList({ items, className }: HubMenuListProps) {
  return (
    <nav className={cn('divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] overflow-hidden', className)}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-4 bg-[var(--card-bg)] px-4 py-4 transition-colors hover:bg-[var(--bg-surface)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            {item.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-body font-semibold">{item.title}</span>
            <span className="block text-caption text-[var(--text-muted)] truncate">{item.subtitle}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden />
        </Link>
      ))}
    </nav>
  )
}
