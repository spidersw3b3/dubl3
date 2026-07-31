import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { DoubleCreditAgreementModal } from '@/components/DoubleCreditAgreementModal'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { PartnerBoostBadge } from '@/components/PartnerBoostBadge'
import { PayResultModal } from '@/components/PayResultModal'
import { SwipeableCarousel } from '@/components/SwipeableCarousel'
import { VirtualCard } from '@/components/VirtualCard'
import { formatUsd } from '@/lib/formatters'
import { paymentApi } from '@/lib/api/paymentApi'
import { partnerApi } from '@/lib/api/partnerApi'
import type { ConfirmPaymentResult } from '@/lib/types/payments'
import type { PartnerBoostMatch } from '@/lib/types/partner'
import { useAuth } from '@/context/AuthProvider'
import { useWalletHydration } from '@/hooks/useWalletHydration'
import { useAppStore } from '@/stores/appStore'
import { useWalletStore } from '@/stores/walletStore'
import { useSocialStore } from '@/stores/socialStore'

export function PayModalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const { user, profile } = useAuth()
  useWalletHydration()

  const { cards, payAmount, doubleEnabled, setPayAmount } = useAppStore()
  const { odds, hasDoubleAgreement, acceptDoubleAgreement, refresh } = useWalletStore()
  const { tryQualifyReferral, refresh: refreshSocial } = useSocialStore()

  const [merchant, setMerchant] = useState('Coffee Shop')
  const [cardIndex, setCardIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [result, setResult] = useState<ConfirmPaymentResult | null>(null)
  const [resultOpen, setResultOpen] = useState(false)
  const [partnerBoost, setPartnerBoost] = useState<PartnerBoostMatch | null>(null)
  const pendingConfirm = useRef(false)
  const lastTap = useRef(0)

  const close = useCallback(() => navigate(from, { replace: true }), [navigate, from])

  const effectiveWinProbability = partnerBoost?.win_probability ?? odds.base_win_probability

  useEffect(() => {
    if (!doubleEnabled) {
      setPartnerBoost(null)
      return
    }
    setPartnerBoost(partnerApi.matchBoost(merchant, odds.base_win_probability))
  }, [merchant, doubleEnabled, odds.base_win_probability])

  const runPayment = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const idempotencyKey = `pay-${user.id}-${Date.now()}`
      const source = cards[cardIndex]
      const intent = await paymentApi.createPaymentIntent(user.id, {
        merchant_name: merchant,
        amount: payAmount,
        source_type: source?.type ?? 'balance',
        source_id: source?.id,
        double_enabled: doubleEnabled,
        idempotency_key: idempotencyKey,
      })

      const confirmResult = await paymentApi.confirmPayment(user.id, {
        intent_id: intent.id,
        double_enabled: doubleEnabled,
        idempotency_key: `${idempotencyKey}-confirm`,
        isTestAccount: profile?.is_test_account,
      })

      await refresh(user.id, profile?.is_test_account)
      await tryQualifyReferral(user.id, 'payment', profile?.is_test_account)
      if (profile?.referral_code) {
        await refreshSocial(user.id, profile.referral_code, profile.is_test_account)
      }
      setResult(confirmResult)
      setResultOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment failed'
      if (msg === 'DOUBLE_CREDIT_AGREEMENT_REQUIRED') {
        setAgreementOpen(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
      pendingConfirm.current = false
    }
  }

  const handleConfirm = () => {
    if (doubleEnabled && !hasDoubleAgreement) {
      setAgreementOpen(true)
      pendingConfirm.current = true
      return
    }
    runPayment()
  }

  const handleAgreementAccept = async () => {
    if (!user) return
    await acceptDoubleAgreement(user.id)
    setAgreementOpen(false)
    if (pendingConfirm.current) {
      pendingConfirm.current = false
      runPayment()
    }
  }

  const handlePanelTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      handleConfirm()
    }
    lastTap.current = now
  }

  const handleResultClose = () => {
    setResultOpen(false)
    close()
  }

  const doublePotential = payAmount * 2
  const winPct = Math.round(effectiveWinProbability * 100)
  const baseWinPct = Math.round(odds.base_win_probability * 100)

  return (
    <>
      <Modal open title="Pay" onClose={close}>
        <div className="space-y-5" onClick={handlePanelTap}>
          <SwipeableCarousel
            onIndexChange={setCardIndex}
            items={cards.map((card) => (
              <VirtualCard key={card.id} card={card} />
            ))}
          />

          <Input
            label="Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          {doubleEnabled && partnerBoost && (
            <PartnerBoostBadge boost={partnerBoost} />
          )}

          <div className="text-center space-y-1">
            <label className="text-caption text-[var(--text-muted)]">Amount</label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-center text-display-l font-bold focus:outline-none"
            />
            {doubleEnabled && (
              <>
                <p className="text-body text-[var(--accent)]">
                  2× back potential: {formatUsd(doublePotential)}
                </p>
                <p className="text-caption text-[var(--text-muted)]">
                  {partnerBoost
                    ? `~${winPct}% win (${baseWinPct}% base + ${partnerBoost.partner.name} boost)`
                    : `~${winPct}% win`} · bonus only, no refund · max ${odds.max_daily_double_usd}/day
                </p>
              </>
            )}
          </div>

          <p className="text-center text-caption text-[var(--text-muted)]">
            Double-tap to confirm
          </p>

          {error && <p className="text-caption text-[var(--danger)] text-center">{error}</p>}

          <div className="flex flex-col gap-2">
            <Button
              fullWidth
              disabled={loading || payAmount <= 0}
              onClick={(e) => { e.stopPropagation(); handleConfirm() }}
            >
              {loading ? 'Processing…' : 'Confirm'}
            </Button>
            <Button variant="ghost" fullWidth onClick={(e) => { e.stopPropagation(); close() }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <DoubleCreditAgreementModal
        open={agreementOpen}
        winProbability={odds.base_win_probability}
        onAccept={handleAgreementAccept}
        onDecline={() => {
          setAgreementOpen(false)
          pendingConfirm.current = false
        }}
      />

      <PayResultModal open={resultOpen} result={result} onClose={handleResultClose} />
    </>
  )
}
