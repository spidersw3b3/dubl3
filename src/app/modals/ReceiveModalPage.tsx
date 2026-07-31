import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { CopyField } from '@/components/CopyField'
import { Modal } from '@/components/Modal'
import { QRDisplay } from '@/components/QRDisplay'
import { useAuth } from '@/context/AuthProvider'
import { useCryptoStore } from '@/stores/cryptoStore'

export function ReceiveModalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string; asset?: string } | null)?.from ?? '/accounts'
  const assetParam = (location.state as { asset?: string } | null)?.asset

  const { user } = useAuth()
  const { selectedAsset, getReceiveAddress } = useCryptoStore()
  const asset = assetParam ?? selectedAsset

  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)

  const close = () => navigate(from, { replace: true })

  useEffect(() => {
    if (!user) return
    getReceiveAddress(user.id, asset)
      .then(setAddress)
      .finally(() => setLoading(false))
  }, [user, asset, getReceiveAddress])

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `My ${asset} address`, text: address })
    } else {
      await navigator.clipboard.writeText(address)
    }
  }

  return (
    <Modal open title="Receive" onClose={close}>
      <div className="space-y-4">
        <p className="text-caption text-[var(--text-muted)]">Your {asset} Address</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : (
          <>
            <QRDisplay value={address} />
            <CopyField value={address} />
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => navigator.clipboard.writeText(address)}>
                Copy Address
              </Button>
              <Button variant="outline" fullWidth onClick={share}>
                <Share2 className="h-4 w-4 mr-1 inline" aria-hidden />
                Share
              </Button>
            </div>
            <p className="text-caption text-[var(--text-muted)] text-center">
              Send only {asset} to this address. Sending other assets may result in permanent loss.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
