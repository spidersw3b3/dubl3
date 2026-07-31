import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/adminApi'
import { User360Drawer } from '@/admin/components/User360Drawer'
import { DataTable } from '@/components/DataTable'
import { Input } from '@/components/Input'
import { formatUsd } from '@/lib/formatters'
import type { AdminUser360, AdminUserSummary } from '@/lib/types/admin'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AdminUser360 | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    void adminApi.listUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter((u) => {
    const q = query.toLowerCase()
    if (!q) return true
    return (
      u.username.toLowerCase().includes(q) ||
      u.display_name.toLowerCase().includes(q) ||
      (u.email?.toLowerCase().includes(q) ?? false)
    )
  })

  const open360 = async (userId: string) => {
    const data = await adminApi.getUser360(userId)
    setSelected(data)
  }

  const refresh360 = async () => {
    if (!selected) return
    const data = await adminApi.getUser360(selected.user.id)
    setSelected(data)
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-heading">Users</h1>
        <p className="text-body text-[var(--text-muted)]">Search and open User 360 drawer</p>
      </div>

      <Input
        label="Search"
        placeholder="Username, email, display name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-body text-[var(--text-muted)]">Loading users…</p>
      ) : (
        <DataTable
          rows={filtered}
          rowKey={(u) => u.id}
          emptyMessage="No users match"
          columns={[
            { key: 'user', header: 'User', render: (u) => `@${u.username}` },
            { key: 'bal', header: 'Balance', render: (u) => formatUsd(u.wallet.balance_usd) },
            { key: 'dubls', header: 'Dubls', render: (u) => String(u.dubl_count) },
            { key: 'ob', header: 'Obligations', render: (u) => String(u.obligation_count) },
            {
              key: 'actions',
              header: '',
              render: (u) => (
                <button
                  type="button"
                  className="text-[var(--accent)] text-caption font-semibold"
                  onClick={() => void open360(u.id)}
                >
                  View 360
                </button>
              ),
            },
          ]}
        />
      )}

      <User360Drawer data={selected} onClose={() => setSelected(null)} onRefresh={refresh360} />
    </div>
  )
}
