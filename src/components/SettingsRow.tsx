import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SettingsRowProps {
  label: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsRow({ label, description, children, className }: SettingsRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium">{label}</p>
        {description && (
          <p className="text-caption text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
