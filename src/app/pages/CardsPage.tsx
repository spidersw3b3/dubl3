import { useState } from 'react'
import { Copy, Plus, Snowflake } from 'lucide-react'
import { Button } from '@/components/Button'
import { SwipeableCarousel } from '@/components/SwipeableCarousel'
import { Toggle } from '@/components/Toggle'
import { VirtualCard } from '@/components/VirtualCard'
import { AppleWalletStubModal } from '@/app/modals/AppleWalletStubModal'
import { useAppStore } from '@/stores/appStore'
import { Toast } from '@/components/Toast'

export function CardsPage() {
  const { cards, cardNumberVisible, setCardNumberVisible, toggleCardFrozen } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const [appleWalletOpen, setAppleWalletOpen] = useState(false)
  const [toast, setToast] = useState(false)

  const activeCard = cards[activeIndex] ?? cards[0]

  const copyNumber = () => {
    navigator.clipboard.writeText(`453288129900${activeCard.last4}`)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading">Cards</h1>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)]"
          aria-label="Add card"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <SwipeableCarousel
        onIndexChange={setActiveIndex}
        items={cards.map((card) => (
          <VirtualCard
            key={card.id}
            card={card}
            showNumber={cardNumberVisible && card.id === activeCard.id}
          />
        ))}
      />

      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] divide-y divide-[var(--border)]">
        <button
          type="button"
          onClick={() => setCardNumberVisible(!cardNumberVisible)}
          className="flex w-full items-center justify-between px-4 py-3 text-body hover:bg-[var(--bg-surface)]"
        >
          <span>Show number</span>
          <Copy className="h-4 w-4 text-[var(--accent)]" onClick={(e) => { e.stopPropagation(); copyNumber() }} />
        </button>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-body">
            <Snowflake className="h-4 w-4 text-[var(--text-muted)]" />
            Freeze card
          </span>
          <Toggle
            checked={activeCard.isFrozen}
            onChange={() => toggleCardFrozen(activeCard.id)}
          />
        </div>

        <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-body hover:bg-[var(--bg-surface)]">
          <span>PIN</span>
          <span className="text-caption text-[var(--text-muted)]">Manage</span>
        </button>

        <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-body hover:bg-[var(--bg-surface)]">
          <span>Replace card</span>
          <span className="text-caption text-[var(--text-muted)]">Request</span>
        </button>
      </div>

      <Button fullWidth variant="outline" onClick={() => setAppleWalletOpen(true)}>
        Add to Apple Wallet
      </Button>

      <AppleWalletStubModal open={appleWalletOpen} onClose={() => setAppleWalletOpen(false)} />
      <Toast message="Card number copied" visible={toast} variant="success" />
    </div>
  )
}
