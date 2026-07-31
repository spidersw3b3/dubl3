import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  right?: ReactNode
  className?: string
}

export function PageHeader({ title, showBack, onBack, right, className }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={cn('flex items-center justify-between gap-3 py-2', className)}>
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button
            type="button"
            onClick={onBack ?? (() => navigate(-1))}
            className="shrink-0 rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-heading truncate">{title}</h1>
      </div>
      {right}
    </header>
  )
}
