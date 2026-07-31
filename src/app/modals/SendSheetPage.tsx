import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { UserPlus } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { SegmentedToggle } from '@/components/SegmentedToggle'
import { Select } from '@/components/Select'
import { Sheet } from '@/components/Sheet'
import { Toast } from '@/components/Toast'
import { formatCrypto, formatUsd } from '@/lib/formatters'
import { cryptoToUsd } from '@/lib/crypto/rates'
import { getFeeUsd, type FeeTier } from '@/lib/api/cryptoMockApi'
import { useAuth } from '@/context/AuthProvider'
import { useCryptoStore } from '@/stores/cryptoStore'
import { useSocialStore } from '@/stores/socialStore'
import { useWalletStore } from '@/stores/walletStore'
import { useWalletHydration } from '@/hooks/useWalletHydration'
import { useSocialHydration } from '@/hooks/useSocialHydration'
import { cn } from '@/lib/utils'

const FEE_OPTIONS: { value: FeeTier; label: string; sub: string }[] = [
  { value: 'slow', label: '$0.12', sub: 'Slow' },
  { value: 'fast', label: '$0.35', sub: 'Fast' },
  { value: 'instant', label: '$0.65', sub: 'Instant' },
]

type SendMode = 'balance' | 'crypto'

export function SendSheetPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; prefilledTo?: string; asset?: string; mode?: SendMode } | null
  const from = state?.from ?? '/dashboard'

  const { user, profile } = useAuth()
  useWalletHydration()
  useSocialHydration()

  const { wallets, selectedAsset, sendCrypto, loading: cryptoLoading } = useCryptoStore()
  const { wallet, refresh: refreshWallet } = useWalletStore()
  const {
    friends,
    searchResults,
    searchUsers,
    clearSearch,
    addFriend,
    sendP2p,
    tryQualifyReferral,
    sending,
    error: socialError,
  } = useSocialStore()

  const [mode, setMode] = useState<SendMode>(state?.mode ?? 'balance')
  const [to, setTo] = useState(state?.prefilledTo ?? '')
  const [asset, setAsset] = useState(state?.asset ?? selectedAsset)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [feeTier, setFeeTier] = useState<FeeTier>('fast')
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const close = useCallback(() => navigate(from, { replace: true }), [navigate, from])
  const amountNum = parseFloat(amount) || 0
  const usdEquiv = cryptoToUsd(amountNum, asset)
  const feeUsd = getFeeUsd(feeTier)

  useEffect(() => {
    if (mode !== 'balance' || to.trim().length < 2) {
      clearSearch()
      return
    }
    const t = setTimeout(() => {
      if (user) void searchUsers(user.id, to.trim())
    }, 200)
    return () => clearTimeout(t)
  }, [to, mode, user, searchUsers, clearSearch])

  const pickRecipient = (username: string) => {
    setTo(username)
    clearSearch()
    setDirty(true)
  }

  const handleAddFriend = async () => {
    if (!user || !to.trim()) return
    try {
      await addFriend(user.id, to.trim(), profile?.is_test_account)
      setToast(`Added @${to.trim()}`)
    } catch {
      // store sets error
    }
  }

  const handleBalanceSend = async () => {
    if (!user || !to.trim() || amountNum <= 0) {
      setError('Enter recipient and amount')
      return
    }
    setError(null)
    try {
      await sendP2p(user.id, {
        to_username: to.trim(),
        amount: amountNum,
        note: note.trim() || undefined,
        idempotency_key: `p2p-${user.id}-${Date.now()}`,
        isTestAccount: profile?.is_test_account,
      })
      const qualify = await tryQualifyReferral(user.id, 'p2p', profile?.is_test_account)
      await refreshWallet(user.id, profile?.is_test_account)
      setToast(qualify.qualified ? qualify.message ?? 'Sent + referral bonus!' : 'Sent successfully')
      setTimeout(() => close(), qualify.qualified ? 1200 : 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    }
  }

  const handleCryptoSend = async () => {
    if (!user || !to.trim() || amountNum <= 0) {
      setError('Enter recipient and amount')
      return
    }
    setError(null)
    try {
      await sendCrypto(user.id, { asset, to: to.trim(), amount: amountNum, feeTier })
      setToast('Sent successfully')
      setTimeout(() => close(), 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    }
  }

  const displayError = error ?? socialError
  const loading = mode === 'balance' ? sending : cryptoLoading

  return (
    <>
      <Sheet open title="Send Money" onClose={close} isDirty={dirty}>
        <div className="space-y-4">
          <SegmentedToggle
            options={[
              { value: 'balance' as const, label: 'Balance' },
              { value: 'crypto' as const, label: 'Crypto' },
            ]}
            value={mode}
            onChange={(v) => { setMode(v); setError(null); setDirty(true) }}
            className="w-full flex"
          />

          <div className="relative">
            <Input
              label="To"
              placeholder={mode === 'balance' ? 'Search username' : 'Enter username or address'}
              value={to}
              onChange={(e) => { setTo(e.target.value); setDirty(true) }}
            />
            {mode === 'balance' && (
              <button
                type="button"
                className="absolute right-3 top-[34px] text-[var(--accent)]"
                aria-label="Add friend"
                onClick={handleAddFriend}
              >
                <UserPlus className="h-5 w-5" />
              </button>
            )}
          </div>

          {mode === 'balance' && searchResults.length > 0 && to.trim().length >= 2 && (
            <ul className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] divide-y divide-[var(--border)] overflow-hidden">
              {searchResults.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-[var(--card-bg)] text-left"
                    onClick={() => pickRecipient(u.username)}
                  >
                    <Avatar initials={u.avatar_initials} size="sm" />
                    <div>
                      <p className="text-body font-medium">@{u.username}</p>
                      <p className="text-caption text-[var(--text-muted)]">{u.display_name}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {mode === 'balance' && friends.length > 0 && (
            <div>
              <p className="text-caption font-medium text-[var(--text-muted)] mb-2">Friends</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {friends.map(({ user: f }) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => pickRecipient(f.username)}
                    className={cn(
                      'flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 min-w-[72px]',
                      to === f.username
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] bg-[var(--bg-surface)]',
                    )}
                  >
                    <Avatar initials={f.avatar_initials} size="sm" />
                    <span className="text-caption truncate max-w-[64px]">@{f.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'crypto' && (
            <Select
              label="Asset"
              value={asset}
              onChange={(e) => { setAsset(e.target.value); setDirty(true) }}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.asset}>
                  {w.asset} — {w.name}
                </option>
              ))}
            </Select>
          )}

          <div className="space-y-1">
            <label className="text-caption font-medium text-[var(--text-muted)]">Amount</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder={mode === 'balance' ? '$0.00' : `0.00 ${asset}`}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setDirty(true) }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-display-l font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {mode === 'balance' ? (
              <p className="text-caption text-[var(--text-muted)]">
                Available: {formatUsd(wallet.balance_usd)}
              </p>
            ) : (
              <p className="text-caption text-[var(--text-muted)]">= {formatUsd(usdEquiv)} USD</p>
            )}
          </div>

          {mode === 'balance' && (
            <Input
              label="Note (optional)"
              placeholder="What's it for?"
              value={note}
              onChange={(e) => { setNote(e.target.value); setDirty(true) }}
            />
          )}

          {mode === 'crypto' && (
            <Select
              label="Network Fee (est.)"
              value={feeTier}
              onChange={(e) => { setFeeTier(e.target.value as FeeTier); setDirty(true) }}
            >
              {FEE_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} — {f.sub}
                </option>
              ))}
            </Select>
          )}

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 space-y-1">
            <div className="flex justify-between text-body">
              <span className="text-[var(--text-muted)]">Total</span>
              <span className="font-semibold">
                {mode === 'balance'
                  ? (amountNum > 0 ? formatUsd(amountNum) : '$0.00')
                  : (amountNum > 0 ? formatCrypto(amountNum, asset) : `0.00 ${asset}`)}
              </span>
            </div>
            {mode === 'crypto' && (
              <div className="flex justify-between text-caption text-[var(--text-muted)]">
                <span>Incl. fee</span>
                <span>{formatUsd(usdEquiv + feeUsd)}</span>
              </div>
            )}
          </div>

          {displayError && <p className="text-caption text-[var(--danger)]">{displayError}</p>}

          <Button
            fullWidth
            disabled={loading}
            onClick={mode === 'balance' ? handleBalanceSend : handleCryptoSend}
          >
            {loading ? 'Sending…' : 'Confirm'}
          </Button>
          <Button variant="ghost" fullWidth onClick={close}>Cancel</Button>
        </div>
      </Sheet>
      <Toast message={toast ?? ''} visible={!!toast} variant="success" />
    </>
  )
}
