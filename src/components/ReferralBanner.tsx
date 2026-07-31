import { Gift } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

export interface ReferralBannerProps {
  onShare?: () => void
}

export function ReferralBanner({ onShare }: ReferralBannerProps) {
  return (
    <Card variant="elevated" className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
        <Gift className="h-5 w-5" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold">Refer a friend — you each get $50</p>
        <p className="text-caption text-[var(--text-muted)]">Share your link when a friend qualifies</p>
      </div>
      <Button size="sm" variant="outline" onClick={onShare}>
        Share Link
      </Button>
    </Card>
  )
}
