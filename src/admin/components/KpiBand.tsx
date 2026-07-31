import { Card } from '@/components/Card'
import { formatUsd } from '@/lib/formatters'
import type { AdminKpis } from '@/lib/types/admin'

export function KpiBand({ kpis }: { kpis: AdminKpis }) {
  const items = [
    { label: 'GMV', value: formatUsd(kpis.gmv_usd) },
    { label: 'Double volume', value: formatUsd(kpis.double_volume_usd) },
    { label: 'Win rate', value: `${Math.round(kpis.double_win_rate * 100)}%` },
    { label: 'Outstanding obligations', value: formatUsd(kpis.outstanding_obligations_usd) },
    { label: 'Active users', value: String(kpis.active_users) },
    { label: 'Ledger rows', value: String(kpis.transaction_count) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} variant="elevated" className="py-4">
          <p className="text-caption text-[var(--text-muted)]">{item.label}</p>
          <p className="text-title font-bold mt-1">{item.value}</p>
        </Card>
      ))}
    </div>
  )
}
