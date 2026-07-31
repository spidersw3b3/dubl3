import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { Select } from '@/components/Select'
import { Card } from '@/components/Card'
import { useAppStore } from '@/stores/appStore'
import { useAuth } from '@/context/AuthProvider'
import { useSocialStore } from '@/stores/socialStore'

export function AddBankModalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/accounts'
  const addBank = useAppStore((s) => s.addBank)
  const { user, profile } = useAuth()
  const { tryQualifyReferral, refresh: refreshSocial } = useSocialStore()

  const [routing, setRouting] = useState('')
  const [account, setAccount] = useState('')
  const [accountType, setAccountType] = useState('checking')
  const [dirty, setDirty] = useState(false)

  const close = () => navigate(from, { replace: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    addBank({
      route: routing,
      accountLast4: account.slice(-4),
      bankName: 'Linked Bank',
      limit: 500,
    })
    if (user) {
      await tryQualifyReferral(user.id, 'bank_link', profile?.is_test_account)
      if (profile?.referral_code) {
        await refreshSocial(user.id, profile.referral_code, profile.is_test_account)
      }
    }
    close()
  }

  return (
    <Modal open title="Add Bank" onClose={close} isDirty={dirty}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Routing Number"
          placeholder="Enter 9-digit routing number"
          inputMode="numeric"
          maxLength={9}
          value={routing}
          onChange={(e) => { setRouting(e.target.value); setDirty(true) }}
          required
        />
        <Input
          label="Account Number"
          placeholder="Enter account number"
          inputMode="numeric"
          value={account}
          onChange={(e) => { setAccount(e.target.value); setDirty(true) }}
          required
        />
        <Select
          label="Account Type"
          value={accountType}
          onChange={(e) => { setAccountType(e.target.value); setDirty(true) }}
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </Select>

        <Card className="flex gap-3 items-start bg-[var(--bg-surface)]">
          <Lock className="h-5 w-5 shrink-0 text-[var(--text-muted)] mt-0.5" aria-hidden />
          <p className="text-caption text-[var(--text-muted)]">
            This is a test connection. No real money will move.
          </p>
        </Card>

        <Button type="submit" fullWidth>Add Bank</Button>
        <Button type="button" variant="ghost" fullWidth onClick={close}>
          Cancel
        </Button>
      </form>
    </Modal>
  )
}
