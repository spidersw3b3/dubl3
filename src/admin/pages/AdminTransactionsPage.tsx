import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Download } from 'lucide-react'
import { adminApi } from '@/lib/api/adminApi'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { formatUsd } from '@/lib/formatters'
import type { AdminLedgerRow } from '@/lib/types/admin'
import { cn } from '@/lib/utils'

const TX_TYPES = [
  'all', 'payment', 'p2p_send', 'p2p_receive', 'double_win', 'double_loss',
  'referral_bonus', 'adjustment', 'deposit', 'withdrawal', 'fee',
]

export function AdminTransactionsPage() {
  const [rows, setRows] = useState<AdminLedgerRow[]>([])
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reconcileMsg, setReconcileMsg] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    void adminApi
      .listLedger({ type, query: query || undefined })
      .then(setRows)
      .finally(() => setLoading(false))
  }, [type, query])

  useEffect(() => { load() }, [load])

  const exportCsv = () => {
    const csv = adminApi.exportLedgerCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dubl-ledger-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const runReconciliation = async () => {
    const report = await adminApi.runReconciliation()
    const csv = adminApi.exportReconciliationCsv(report)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dubl-reconciliation-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setReconcileMsg(
      report.mismatch_count === 0
        ? `Reconciliation OK — ${report.total_rows} wallets balanced`
        : `${report.mismatch_count} mismatch(es) — see export`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-heading">Transactions</h1>
          <p className="text-body text-[var(--text-muted)]">Unified ledger explorer — read-only rows</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button size="sm" variant="outline" onClick={runReconciliation}>
          Reconcile
        </Button>
      </div>

      {reconcileMsg && (
        <p className="text-caption text-[var(--accent)]">{reconcileMsg}</p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          {TX_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Input
          label="Search"
          placeholder="User, merchant, id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-end">
          <Button fullWidth onClick={load}>Apply filters</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-body text-[var(--text-muted)]">Loading ledger…</p>
      ) : rows.length === 0 ? (
        <p className="text-body text-[var(--text-muted)] py-8 text-center">No ledger rows</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          {rows.map((row) => {
            const open = expanded === row.id
            return (
              <div key={row.id} className="border-b border-[var(--border)] last:border-0">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-surface)]"
                  onClick={() => setExpanded(open ? null : row.id)}
                >
                  {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="text-caption font-mono w-24 shrink-0 truncate">{row.type}</span>
                  <span className="text-body flex-1 min-w-0 truncate">@{row.username}</span>
                  <span className={cn(
                    'text-body font-semibold shrink-0',
                    row.direction === 'credit' ? 'text-[var(--success)]' : 'text-[var(--danger)]',
                  )}>
                    {row.direction === 'credit' ? '+' : '−'}{formatUsd(row.amount)}
                  </span>
                  <span className="text-caption text-[var(--text-muted)] shrink-0 hidden sm:block">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </button>
                {open && (
                  <div className="bg-[var(--bg-surface)] px-4 pb-4 pt-1 text-caption space-y-1 font-mono">
                    <p>id: {row.id}</p>
                    <p>user_id: {row.user_id}</p>
                    <p>balance: {formatUsd(row.balance_before)} → {formatUsd(row.balance_after)}</p>
                    {row.reference_type && <p>ref: {row.reference_type} / {row.reference_id}</p>}
                    {row.merchant_name && <p>merchant: {row.merchant_name}</p>}
                    {row.metadata && Object.keys(row.metadata).length > 0 && (
                      <pre className="whitespace-pre-wrap break-all text-[var(--text-muted)]">
                        {JSON.stringify(row.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
