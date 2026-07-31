import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'

export function ScanQrModalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/accounts'

  const [pasteOpen, setPasteOpen] = useState(false)
  const [address, setAddress] = useState('')

  const close = () => navigate(from, { replace: true })

  const goToSendWithAddress = () => {
    navigate('/send', {
      replace: true,
      state: { from, prefilledTo: address },
    })
  }

  return (
    <Modal open title="Scan QR" onClose={close}>
      <div className="space-y-4">
        {/* Camera viewfinder placeholder */}
        <div className="relative mx-auto aspect-square max-w-xs rounded-2xl bg-[#0a0a0a] overflow-hidden">
          <div className="absolute inset-8 border-2 border-white/80 rounded-lg pointer-events-none">
            <span className="absolute -top-px -left-px h-6 w-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <span className="absolute -top-px -right-px h-6 w-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <span className="absolute -bottom-px -left-px h-6 w-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <span className="absolute -bottom-px -right-px h-6 w-6 border-b-4 border-r-4 border-white rounded-br-lg" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-caption text-white/50">Camera preview (mock)</p>
          </div>
        </div>

        <p className="text-center text-body text-[var(--text-muted)]">
          Align QR code within the frame
        </p>

        {!pasteOpen ? (
          <Button variant="ghost" fullWidth onClick={() => setPasteOpen(true)}>
            Paste Address Instead
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              label="Wallet address"
              placeholder="Paste address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button fullWidth disabled={!address.trim()} onClick={goToSendWithAddress}>
              Continue to Send
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
