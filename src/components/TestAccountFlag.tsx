import { cn } from '@/lib/utils'

export interface TestAccountFlagProps {
  className?: string
}

export function TestAccountFlag({ className }: TestAccountFlagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-label',
        'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/40',
        className,
      )}
      title="Mock environment — no real money moves"
    >
      Test Account
    </span>
  )
}
