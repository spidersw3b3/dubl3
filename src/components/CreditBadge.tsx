import { formatUsd } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export interface CreditBadgeProps {
  amount: number
  className?: string
}

export function CreditBadge({ amount, className }: CreditBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold',
        'bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--accent)]',
        className,
      )}
    >
      Available Credit {formatUsd(amount)}
    </span>
  )
}
