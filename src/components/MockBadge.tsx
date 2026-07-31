import { cn } from '@/lib/utils'

export function MockBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-label',
        'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/40',
        className,
      )}
    >
      MOCK
    </span>
  )
}
