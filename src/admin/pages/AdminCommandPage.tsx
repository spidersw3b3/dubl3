import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { adminApi } from '@/lib/api/adminApi'
import { KpiBand } from '@/admin/components/KpiBand'
import { Card } from '@/components/Card'
import type { AdminKpis } from '@/lib/types/admin'

export function AdminCommandPage() {
  const [kpis, setKpis] = useState<AdminKpis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void adminApi.getKpis().then(setKpis).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading">Command</h1>
        <p className="text-body text-[var(--text-muted)]">Platform KPIs at a glance</p>
      </div>

      {loading || !kpis ? (
        <p className="text-body text-[var(--text-muted)]">Loading KPIs…</p>
      ) : (
        <KpiBand kpis={kpis} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated">
          <h2 className="text-body font-semibold mb-2">Quick links</h2>
          <ul className="space-y-2 text-body">
            <li><Link className="text-[var(--accent)]" to="/dubl-admin-7k2m9/transactions">Transaction explorer →</Link></li>
            <li><Link className="text-[var(--accent)]" to="/dubl-admin-7k2m9/collections">Collections queue →</Link></li>
            <li><Link className="text-[var(--accent)]" to="/dubl-admin-7k2m9/double-engine">Double Engine config →</Link></li>
          </ul>
        </Card>
        <Card variant="elevated">
          <h2 className="text-body font-semibold mb-2">Ops notes</h2>
          <p className="text-caption text-[var(--text-muted)]">
            Mock admin reads live in-memory player ledger. Player actions (pay, double, P2P) appear here after refresh.
          </p>
        </Card>
      </div>
    </div>
  )
}
