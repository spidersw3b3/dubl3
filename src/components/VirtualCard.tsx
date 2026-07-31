import { cn } from '@/lib/utils'
import type { PaymentCard } from '@/lib/mock/seedData'

export interface VirtualCardProps {
  card: PaymentCard
  showNumber?: boolean
  className?: string
}

export function VirtualCard({ card, showNumber, className }: VirtualCardProps) {
  const isCrypto = card.type === 'crypto'

  return (
    <div
      className={cn(
        'relative aspect-[1.586/1] w-full max-w-sm rounded-2xl p-5 shadow-lg',
        isCrypto
          ? 'bg-gradient-to-br from-[#1a1a2e] to-[#0B3D3A] text-white'
          : 'bg-gradient-to-br from-[var(--accent)] to-[#0B3D3A] text-white',
        card.isFrozen && 'opacity-60 grayscale',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-caption font-semibold opacity-90">{card.label}</span>
        {isCrypto ? (
          <span className="text-title font-bold">₿</span>
        ) : (
          <span className="text-label tracking-widest">VISA</span>
        )}
      </div>

      <div className="mt-8 font-mono text-body-lg tracking-widest">
        {showNumber && !isCrypto
          ? `4532 8812 9900 ${card.last4}`
          : `•••• •••• •••• ${card.last4}`}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-label opacity-70">VALID THRU</p>
          <p className="text-caption font-semibold">{card.exp}</p>
        </div>
        {card.isFrozen && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-label">FROZEN</span>
        )}
      </div>
    </div>
  )
}
