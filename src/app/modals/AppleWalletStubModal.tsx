import { Modal } from '@/components/Modal'
import { MockBadge } from '@/components/MockBadge'
import { Button } from '@/components/Button'

interface AppleWalletStubModalProps {
  open: boolean
  onClose: () => void
}

export function AppleWalletStubModal({ open, onClose }: AppleWalletStubModalProps) {
  return (
    <Modal open={open} title="Add to Apple Wallet" onClose={onClose}>
      <div className="space-y-4 text-center">
        <MockBadge />
        <p className="text-body text-[var(--text-muted)]">
          Apple Wallet integration is coming soon. This is a UI preview only — no pass will be generated.
        </p>
        <Button fullWidth onClick={onClose}>Got it</Button>
      </div>
    </Modal>
  )
}
