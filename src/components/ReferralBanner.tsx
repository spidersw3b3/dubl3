import { Gift } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { formatUsd } from '@/lib/formatters'
import type { ReferralStats } from '@/lib/types/social'

export interface ReferralBannerProps {
  stats?: ReferralStats | null
  onShare?: () => void
}

export function ReferralBanner({ stats, onShare }: ReferralBannerProps) {
  const hasStats = stats && (stats.pending_count > 0 || stats.qualified_count > 0 || stats.total_bonus_earned > 0)

  return (
    <Card variant="elevated" className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
        <Gift className="h-5 w-5" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold">Refer a friend — you each get $50</p>
        <p className="text-caption text-[var(--text-muted)]">
          {hasStats
            ? `${stats!.qualified_count} qualified · ${stats!.pending_count} pending · ${formatUsd(stats!.total_bonus_earned)} earned`
            : 'Share your link when a friend qualifies'}
        </p>
        {stats?.referral_code && (
          <p className="text-caption text-[var(--text-muted)] mt-0.5">
            Code: <span className="font-mono text-[var(--text-primary)]">{stats.referral_code}</span>
          </p>
        )}
      </div>
      <Button size="sm" variant="outline" onClick={onShare}>
        Share Link
      </Button>
    </Card>
  )
}
