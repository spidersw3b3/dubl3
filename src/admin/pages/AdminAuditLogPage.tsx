import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/adminApi'
import { DataTable } from '@/components/DataTable'
import type { AdminAuditEntry } from '@/lib/types/admin'

export function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void adminApi.listAuditLog().then(setEntries).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-heading">Audit Log</h1>
        <p className="text-body text-[var(--text-muted)]">Append-only record of admin mutations with reason notes</p>
      </div>

      {loading ? (
        <p className="text-body text-[var(--text-muted)]">Loading audit log…</p>
      ) : (
        <DataTable
          rows={entries}
          rowKey={(e) => e.id}
          emptyMessage="No audit entries yet"
          columns={[
            { key: 'time', header: 'Time', render: (e) => new Date(e.created_at).toLocaleString() },
            { key: 'admin', header: 'Admin', render: (e) => e.admin_email },
            { key: 'action', header: 'Action', render: (e) => e.action },
            { key: 'target', header: 'Target', render: (e) => e.target_type ? `${e.target_type}:${e.target_id}` : '—' },
            { key: 'reason', header: 'Reason', render: (e) => e.reason },
          ]}
        />
      )}
    </div>
  )
}
