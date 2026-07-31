import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  className?: string
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  className,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-body text-[var(--text-muted)]">{emptyMessage}</p>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-[var(--border)]', className)}>
      <table className="w-full min-w-[480px] text-left text-body">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-label text-[var(--text-muted)]', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-[var(--border)] last:border-0">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
