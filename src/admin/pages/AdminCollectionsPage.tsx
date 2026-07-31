import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/adminApi'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { AdminConfirmDialog } from '@/admin/components/AdminConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { formatUsd } from '@/lib/formatters'
import type { AdminCollectionRow, CollectionActionParams } from '@/lib/types/admin'

export function AdminCollectionsPage() {
  const { user } = useAdminAuth()
  const [rows, setRows] = useState<AdminCollectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<CollectionActionParams | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    void adminApi.listCollections().then(setRows).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const runAction = async (reason: string) => {
    if (!user || !pending) return
    setSaving(true)
    try {
      await adminApi.collectionAction(user, { ...pending, reason })
      setPending(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-heading">Collections</h1>
        <p className="text-body text-[var(--text-muted)]">Outstanding double obligations — mock ACH + manual actions</p>
      </div>

      {loading ? (
        <p className="text-body text-[var(--text-muted)]">Loading queue…</p>
      ) : (
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage="No open obligations 🎉"
          columns={[
            { key: 'user', header: 'User', render: (r) => `@${r.username}` },
            { key: 'principal', header: 'Principal', render: (r) => formatUsd(r.principal) },
            { key: 'due', header: 'Due', render: (r) => r.due_date },
            { key: 'status', header: 'Status', render: (r) => r.status },
            {
              key: 'actions',
              header: 'Actions',
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-caption text-[var(--accent)] font-semibold"
                    onClick={() => setPending({ obligation_id: r.id, action: 'retry_ach', reason: '' })}
                  >
                    Retry ACH
                  </button>
                  <button
                    type="button"
                    className="text-caption text-[var(--success)] font-semibold"
                    onClick={() => setPending({ obligation_id: r.id, action: 'mark_paid', reason: '' })}
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    className="text-caption text-[var(--danger)] font-semibold"
                    onClick={() => setPending({ obligation_id: r.id, action: 'mark_written_off', reason: '' })}
                  >
                    Write off
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <AdminConfirmDialog
        open={!!pending}
        title={`Collection: ${pending?.action.replace(/_/g, ' ') ?? ''}`}
        description="Mock collection action — logged to audit log."
        confirmLabel="Execute"
        loading={saving}
        onCancel={() => setPending(null)}
        onConfirm={runAction}
      />
    </div>
  )
}
