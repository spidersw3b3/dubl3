import { useState } from 'react'
import { Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { ADDABLE_WALLETS } from '@/lib/mock/seedData'
import { useAuth } from '@/context/AuthProvider'
import { useCryptoStore } from '@/stores/cryptoStore'
import { cn } from '@/lib/utils'

const ASSET_ICONS: Record<string, string> = {
  DOGE: '🐕',
  XRP: '✕',
  SOL: '◎',
}

export function AddWalletModalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/accounts'

  const { user } = useAuth()
  const { wallets, addWallets, loading } = useCryptoStore()
  const existingAssets = new Set(wallets.map((w) => w.asset))

  const [selected, setSelected] = useState<string[]>(() =>
    ADDABLE_WALLETS.map((w) => w.code).filter((c) => !existingAssets.has(c)),
  )
  const [error, setError] = useState<string | null>(null)

  const close = () => navigate(from, { replace: true })

  const toggle = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const handleAdd = async () => {
    if (!user) return
    const toAdd = selected.filter((c) => !existingAssets.has(c))
    if (toAdd.length === 0) {
      close()
      return
    }
    setError(null)
    try {
      await addWallets(user.id, toAdd)
      close()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add wallets')
    }
  }

  const newCount = selected.filter((c) => !existingAssets.has(c)).length

  return (
    <Modal open title="Add Wallet" onClose={close}>
      <p className="text-caption text-[var(--text-muted)] mb-4">Select assets to add</p>

      <ul className="space-y-2 mb-6">
        {ADDABLE_WALLETS.map(({ code, name }) => {
          const isSelected = selected.includes(code)
          const alreadyAdded = existingAssets.has(code)
          return (
            <li key={code}>
              <button
                type="button"
                disabled={alreadyAdded}
                onClick={() => toggle(code)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-[var(--border)] bg-[var(--card-bg)]',
                  alreadyAdded && 'opacity-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md border',
                    isSelected ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)]',
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </span>
                <span className="text-lg">{ASSET_ICONS[code] ?? '●'}</span>
                <span className="flex-1 text-left">
                  <span className="block text-body font-semibold">{code}</span>
                  <span className="block text-caption text-[var(--text-muted)]">{name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {error && <p className="text-caption text-[var(--danger)] mb-3">{error}</p>}

      <Button fullWidth disabled={loading || newCount === 0} onClick={handleAdd}>
        {loading ? 'Adding…' : `Add Selected (${newCount})`}
      </Button>
      <Button variant="ghost" fullWidth onClick={close} className="mt-2">
        Cancel
      </Button>
    </Modal>
  )
}
