import { Sparkles } from 'lucide-react'
import { Card } from './Card'
import type { PartnerBoostMatch } from '@/lib/types/partner'

interface PartnerBoostBadgeProps {
  boost: PartnerBoostMatch | null
}

export function PartnerBoostBadge({ boost }: PartnerBoostBadgeProps) {
  if (!boost) return null

  const basePct = Math.round(boost.base_win_probability * 100)
  const boostPct = Math.round(boost.win_probability * 100)

  return (
    <Card className="flex items-start gap-3 border-[var(--accent)]/40 bg-[var(--accent)]/10">
      <Sparkles className="h-5 w-5 shrink-0 text-[var(--accent)] mt-0.5" aria-hidden />
      <div className="space-y-0.5">
        <p className="text-body font-semibold">{boost.partner.name} Partner Boost</p>
        <p className="text-caption text-[var(--text-muted)]">
          Win rate {basePct}% → <span className="text-[var(--accent)] font-semibold">{boostPct}%</span>
          {' '}· Subsidy remaining {boost.subsidy_remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>
      </div>
    </Card>
  )
}
