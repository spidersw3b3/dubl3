import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { formatUsd } from '@/lib/formatters'
import { DEV_SERVER_SEED_HASH } from '@/lib/crypto/provablyFair'
import { useWalletHydration } from '@/hooks/useWalletHydration'
import { useWalletStore } from '@/stores/walletStore'
import { cn } from '@/lib/utils'

export function DublsPage() {
  useWalletHydration()
  const { dubls, loading, odds } = useWalletStore()

  return (
    <div className="space-y-6">
      <PageHeader title="Dubls" showBack />

      <p className="text-body text-[var(--text-muted)]">
        Bonus-only wins at ~{(odds.base_win_probability * 100).toFixed(0)}% — payment never refunded.
      </p>

      <p className="text-label text-[var(--text-muted)]">
        Server seed hash: {DEV_SERVER_SEED_HASH}
      </p>

      {loading && dubls.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : dubls.length === 0 ? (
        <Card className="text-center py-10 space-y-3">
          <Trophy className="mx-auto h-10 w-10 text-[var(--text-muted)]" aria-hidden />
          <p className="text-title">No doubles yet</p>
          <p className="text-caption text-[var(--text-muted)]">
            Pay with Double enabled to flip for up to 2× back.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {dubls.map((d) => (
            <li key={d.id}>
              <Card className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-body font-semibold">{d.merchant_name}</p>
                    <p className="text-caption text-[var(--text-muted)]">
                      {new Date(d.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-label font-semibold',
                      d.outcome === 'win'
                        ? 'bg-[var(--success)]/20 text-[var(--success)]'
                        : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]',
                    )}
                  >
                    {d.outcome === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-[var(--text-muted)]">Staked</span>
                  <span>{formatUsd(d.stake_amount)}</span>
                </div>
                {d.outcome === 'win' && (
                  <div className="flex justify-between text-body text-[var(--success)]">
                    <span>Bonus earned</span>
                    <span className="font-semibold">+{formatUsd(d.payout_amount)}</span>
                  </div>
                )}
                <p className="text-label text-[var(--text-muted)] truncate" title={d.rng_seed_hash}>
                  HMAC: {d.rng_seed_hash}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
