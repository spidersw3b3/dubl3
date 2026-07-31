import { Link, useNavigate } from 'react-router'
import {
  ArrowDownUp,
  CreditCard,
  Dices,
  Landmark,
  Send,
  Wallet,
} from 'lucide-react'
import {
  Avatar,
  BalanceHeader,
  Card,
  FAQAccordion,
  IconCircleButton,
  ReferralBanner,
} from '@/components'
import { FAQ_ITEMS } from '@/lib/constants/faq'
import { formatUsd } from '@/lib/formatters'
import { useAuth } from '@/context/AuthProvider'
import { useWalletHydration } from '@/hooks/useWalletHydration'
import { useSocialHydration } from '@/hooks/useSocialHydration'
import { useAppStore } from '@/stores/appStore'
import { useWalletStore } from '@/stores/walletStore'
import { useSocialStore } from '@/stores/socialStore'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  useWalletHydration()
  useSocialHydration()

  const { wallet, obligations } = useWalletStore()
  const { referralStats } = useSocialStore()
  const { doubleEnabled, payAmount, toggleDouble } = useAppStore()

  const availableCredit = wallet.double_credit_limit - wallet.double_credit_used
  const openObligations = obligations.filter((o) => o.status === 'open')

  const openPay = () => navigate('/pay', { state: { from: '/dashboard' } })
  const openSend = () => navigate('/send', { state: { from: '/dashboard' } })

  return (
    <div className="space-y-6 pb-4">
      <div className="flex justify-end">
        <Link to="/profile">
          <Avatar initials={profile?.avatar_initials ?? '??'} />
        </Link>
      </div>

      <Card variant="elevated">
        <BalanceHeader
          totalBalance={wallet.balance_usd}
          availableCredit={availableCredit > 0 ? availableCredit : undefined}
          isTestAccount={profile?.is_test_account}
        />
      </Card>

      {openObligations.length > 0 && (
        <Card className="border-[var(--warning)]/40 bg-[var(--warning)]/10 text-caption">
          <p className="font-semibold text-body">Outstanding double obligation</p>
          <p className="text-[var(--text-muted)]">
            {formatUsd(openObligations[0].principal)} due {openObligations[0].due_date}
          </p>
        </Card>
      )}

      <div className="flex justify-around">
        <IconCircleButton label="Add / Withdraw" onClick={() => navigate('/accounts')}>
          <ArrowDownUp className="h-6 w-6" />
        </IconCircleButton>
        <IconCircleButton label="Cards" onClick={() => navigate('/cards')}>
          <CreditCard className="h-6 w-6" />
        </IconCircleButton>
        <IconCircleButton label="Accounts" onClick={() => navigate('/accounts')}>
          <Landmark className="h-6 w-6" />
        </IconCircleButton>
      </div>

      <div className="flex justify-around">
        <IconCircleButton label="Pay" onClick={openPay}>
          <Wallet className="h-6 w-6" />
        </IconCircleButton>
        <button
          type="button"
          onClick={toggleDouble}
          className="flex flex-col items-center gap-2 group focus-visible:outline-none"
        >
          <span
            className={cn(
              'inline-flex h-16 w-16 items-center justify-center rounded-full border transition-colors',
              doubleEnabled
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white',
            )}
          >
            <Dices className="h-6 w-6" />
          </span>
          <span className="text-caption text-[var(--text-muted)]">Double</span>
        </button>
        <IconCircleButton label="Send" onClick={openSend}>
          <Send className="h-6 w-6" />
        </IconCircleButton>
      </div>

      {doubleEnabled && (
        <Card className="text-center py-3">
          <p className="text-caption text-[var(--text-muted)]">Amount Doubled</p>
          <p className="text-title text-[var(--accent)]">
            {formatUsd(payAmount)} → {formatUsd(payAmount * 2)} potential
          </p>
        </Card>
      )}

      <ReferralBanner
        stats={referralStats}
        onShare={() => {
          const url = referralStats?.share_url ?? `https://dubl.app/r/${profile?.referral_code ?? 'TEST'}`
          void navigator.clipboard.writeText(url)
        }}
      />

      <FAQAccordion items={[...FAQ_ITEMS]} />

      <footer className="flex justify-center gap-3 text-caption text-[var(--text-muted)] pt-2">
        <button type="button" className="hover:text-[var(--accent)]">Help</button>
        <span>·</span>
        <button type="button" className="hover:text-[var(--accent)]">Terms</button>
        <span>·</span>
        <button type="button" className="hover:text-[var(--accent)]">Privacy</button>
      </footer>
    </div>
  )
}
