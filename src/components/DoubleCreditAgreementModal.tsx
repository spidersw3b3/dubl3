import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'

interface DoubleCreditAgreementModalProps {
  open: boolean
  onAccept: () => void
  onDecline: () => void
  winProbability: number
}

export function DoubleCreditAgreementModal(props: DoubleCreditAgreementModalProps) {
  const { onAccept, onDecline, winProbability } = props
  const pct = Math.round(winProbability * 100)

  return (
    <Modal open title="Double Credit Agreement" onClose={onDecline}>
      <div className="space-y-4 text-body text-[var(--text-muted)]">
        <p>
          Double Pay lets you flip eligible purchases for a chance at <strong className="text-[var(--text-primary)]">bonus Balance only</strong> — your original payment is not refunded.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-caption">
          <li>Current win rate: ~{pct}% (admin-configurable)</li>
          <li>Win: bonus credited to DUBL Balance</li>
          <li>Loss: no bonus; amounts may debit Double Credit or linked bank per waterfall</li>
          <li>Outstanding balances may create collectable obligations</li>
        </ul>
        <p className="text-caption">
          Not a bank — banking services provided by partners. Demo environment.
        </p>
        <Button fullWidth onClick={onAccept}>
          I Accept
        </Button>
        <Button variant="ghost" fullWidth onClick={onDecline}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
