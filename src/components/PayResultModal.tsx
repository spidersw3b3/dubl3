import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { formatUsd } from '@/lib/formatters'
import type { ConfirmPaymentResult } from '@/lib/types/payments'
import { cn } from '@/lib/utils'

interface PayResultModalProps {
  open: boolean
  result: ConfirmPaymentResult | null
  onClose: () => void
}

export function PayResultModal({ open, result, onClose }: PayResultModalProps) {
  if (!result) return null

  const { intent, wallet, double, obligation } = result
  const isWin = double?.outcome === 'win'
  const isLoss = double?.outcome === 'loss'

  return (
    <Modal open={open} title="Payment Complete" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <p className="text-caption text-[var(--text-muted)]">{intent.merchant_name}</p>
          <p className="text-display-l">{formatUsd(intent.amount)}</p>
          <p className="text-caption text-[var(--success)]">Payment settled</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-body">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">New balance</span>
            <span className="font-semibold">{formatUsd(wallet.balance_usd)}</span>
          </div>
          {wallet.double_credit_used > 0 && (
            <div className="flex justify-between mt-1 text-caption text-[var(--text-muted)]">
              <span>Credit line used</span>
              <span>{formatUsd(wallet.double_credit_used)} / {formatUsd(wallet.double_credit_limit)}</span>
            </div>
          )}
        </div>

        {double && (
          <div
            className={cn(
              'rounded-xl border px-4 py-3 flex items-start gap-3',
              isWin && 'border-[var(--success)]/40 bg-[var(--success)]/10',
              isLoss && 'border-[var(--border)] bg-[var(--card-bg)]',
            )}
          >
            {isWin ? (
              <CheckCircle className="h-6 w-6 shrink-0 text-[var(--success)]" />
            ) : (
              <XCircle className="h-6 w-6 shrink-0 text-[var(--text-muted)]" />
            )}
            <div className="space-y-1">
              <p className="text-body font-semibold">
                {isWin ? `2× Back — ${formatUsd(double.payout_amount)} earned` : 'No bonus this time'}
              </p>
              <p className="text-caption text-[var(--text-muted)]">
                Odds used: {(double.win_probability * 100).toFixed(0)}%
                {double.partner_brand_name && (
                  <> · {double.partner_brand_name} boost (base {(double.base_win_probability ?? double.win_probability) * 100}%)</>
                )}
                {' '}· Roll verified
              </p>
              {double.subsidy_burned != null && double.subsidy_burned > 0 && (
                <p className="text-caption text-[var(--accent)]">
                  Partner subsidy: {formatUsd(double.subsidy_burned)} burned
                </p>
              )}
              <p className="text-label text-[var(--text-muted)] truncate" title={double.rng_seed_hash}>
                HMAC: {double.rng_seed_hash.slice(0, 24)}…
              </p>
            </div>
          </div>
        )}

        {obligation && (
          <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--warning)]" />
            <div className="text-caption text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--text-primary)]">Obligation created</p>
              <p>
                {formatUsd(obligation.principal)} due by {obligation.due_date}. Mock collection — visible in admin Phase 7.
              </p>
            </div>
          </div>
        )}

        <Button fullWidth onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}
