import { formatUsd } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { CreditBadge } from './CreditBadge'
import { TestAccountFlag } from './TestAccountFlag'

export interface BalanceHeaderProps {
  totalBalance: number
  availableCredit?: number
  isTestAccount?: boolean
  className?: string
}

export function BalanceHeader({
  totalBalance,
  availableCredit,
  isTestAccount,
  className,
}: BalanceHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-caption text-[var(--text-muted)]">Total Balance</p>
          <p className="text-display-xl">{formatUsd(totalBalance)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isTestAccount && <TestAccountFlag />}
          {availableCredit !== undefined && (
            <CreditBadge amount={availableCredit} />
          )}
        </div>
      </div>
    </div>
  )
}
