import { useState } from 'react'
import { X } from 'lucide-react'
import { adminApi } from '@/lib/api/adminApi'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { AdminConfirmDialog } from '@/admin/components/AdminConfirmDialog'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DataTable } from '@/components/DataTable'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { formatUsd } from '@/lib/formatters'
import type { AdminUser360 } from '@/lib/types/admin'

interface User360DrawerProps {
  data: AdminUser360 | null
  onClose: () => void
  onRefresh?: () => void
}

export function User360Drawer({ data, onClose, onRefresh }: User360DrawerProps) {
  const { user: admin } = useAdminAuth()
  const [adjAmount, setAdjAmount] = useState('')
  const [adjDir, setAdjDir] = useState<'credit' | 'debit'>('credit')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!data) return null

  const { user, transactions, dubls, obligations, payment_intents } = data

  const submitAdjustment = async (reason: string) => {
    if (!admin) return
    const amount = parseFloat(adjAmount)
    if (!amount || amount <= 0) return
    setSaving(true)
    try {
      await adminApi.ledgerAdjustment(admin, {
        user_id: user.id,
        amount,
        direction: adjDir,
        reason,
      })
      setConfirmOpen(false)
      setAdjAmount('')
      onRefresh?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="flex h-full w-full max-w-lg flex-col bg-[var(--bg-primary)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div>
            <h2 className="text-heading">User 360</h2>
            <p className="text-caption text-[var(--text-muted)]">@{user.username}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <p className="text-caption text-[var(--text-muted)]">Wallet</p>
            <p className="text-title font-bold">{formatUsd(user.wallet.balance_usd)}</p>
            <p className="text-caption text-[var(--text-muted)] mt-1">
              Credit {formatUsd(user.wallet.double_credit_used)} / {formatUsd(user.wallet.double_credit_limit)}
            </p>
          </Card>

          {admin?.role === 'master' || admin?.role === 'finance' ? (
            <Card className="space-y-3">
              <h3 className="text-body font-semibold">Ledger adjustment</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Amount USD"
                  inputMode="decimal"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                />
                <Select label="Direction" value={adjDir} onChange={(e) => setAdjDir(e.target.value as 'credit' | 'debit')}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </Select>
              </div>
              <Button size="sm" fullWidth onClick={() => setConfirmOpen(true)} disabled={!adjAmount}>
                Post adjustment
              </Button>
            </Card>
          ) : null}

          <section>
            <h3 className="text-body font-semibold mb-2">Recent transactions</h3>
            <DataTable
              rows={transactions.slice(0, 8)}
              rowKey={(r) => r.id}
              emptyMessage="No transactions"
              columns={[
                { key: 'type', header: 'Type', render: (r) => r.type },
                { key: 'amt', header: 'Amount', render: (r) => formatUsd(r.amount) },
                { key: 'dir', header: 'Dir', render: (r) => r.direction },
              ]}
            />
          </section>

          <section>
            <h3 className="text-body font-semibold mb-2">Dubls ({dubls.length})</h3>
            {dubls.length === 0 ? (
              <p className="text-caption text-[var(--text-muted)]">No double attempts</p>
            ) : (
              dubls.slice(0, 5).map((d) => (
                <div key={d.id} className="text-caption border-b border-[var(--border)] py-2">
                  {d.merchant_name} — {d.outcome} — {formatUsd(d.stake_amount)}
                </div>
              ))
            )}
          </section>

          <section>
            <h3 className="text-body font-semibold mb-2">Obligations ({obligations.length})</h3>
            {obligations.length === 0 ? (
              <p className="text-caption text-[var(--text-muted)]">None</p>
            ) : (
              obligations.map((o) => (
                <div key={o.id} className="text-caption border-b border-[var(--border)] py-2">
                  {formatUsd(o.principal)} — {o.status} — due {o.due_date}
                </div>
              ))
            )}
          </section>

          <section>
            <h3 className="text-body font-semibold mb-2">Payment intents ({payment_intents.length})</h3>
            {payment_intents.slice(0, 5).map((i) => (
              <div key={i.id} className="text-caption border-b border-[var(--border)] py-2">
                {i.merchant_name} — {formatUsd(i.amount)} — {i.status}
              </div>
            ))}
          </section>
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <Button variant="ghost" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>

      <AdminConfirmDialog
        open={confirmOpen}
        title="Ledger adjustment"
        description={`${adjDir} ${formatUsd(parseFloat(adjAmount) || 0)} to @${user.username}. Maker-checker: reason required.`}
        confirmLabel="Post"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submitAdjustment}
      />
    </div>
  )
}
