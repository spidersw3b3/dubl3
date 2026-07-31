import { formatCrypto, truncateAddress } from '@/lib/formatters'
import type { CryptoTransaction } from '@/lib/api/cryptoMockApi'
import { cn } from '@/lib/utils'

function formatTxDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export interface CryptoActivityListProps {
  transactions: CryptoTransaction[]
  limit?: number
  className?: string
}

export function CryptoActivityList({ transactions, limit, className }: CryptoActivityListProps) {
  const rows = limit ? transactions.slice(0, limit) : transactions

  if (rows.length === 0) {
    return (
      <p className={cn('py-6 text-center text-body text-[var(--text-muted)]', className)}>
        No activity yet
      </p>
    )
  }

  return (
    <ul className={cn('divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden', className)}>
      {rows.map((tx) => {
        const type = tx.status === 'pending' ? 'pending' : tx.direction === 'in' ? 'received' : 'sent'
        return (
          <li key={tx.id} className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-3">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                type === 'received' && 'bg-[var(--success)]/20 text-[var(--success)]',
                type === 'sent' && 'bg-[var(--danger)]/20 text-[var(--danger)]',
                type === 'pending' && 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]',
              )}
            >
              {type === 'received' ? '↓' : type === 'sent' ? '↑' : '⏱'}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-body font-medium capitalize">{type}</span>
              <span className="block text-caption text-[var(--text-muted)] truncate">
                {truncateAddress(tx.counterpartyAddress)}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-body font-medium">
                {formatCrypto(tx.amount, tx.asset, tx.asset === 'USDT' ? 2 : 4)}
              </span>
              <span className="block text-caption text-[var(--text-muted)]">
                {formatTxDate(tx.createdAt)}
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
