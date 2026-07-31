import { Download, FileText } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { MockBadge } from '@/components/MockBadge'
import { useProfileHydration } from '@/hooks/useProfileHydration'
import { useProfileStore } from '@/stores/profileStore'
import { isSupabaseConfigured, getSupabaseOptional } from '@/lib/supabase'

async function downloadTaxDoc(storagePath: string, label: string) {
  if (isSupabaseConfigured && storagePath.startsWith('tax-docs/')) {
    const supabase = getSupabaseOptional()!
    const { data, error } = await supabase.storage.from('tax-docs').download(storagePath)
    if (error) throw error
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = `${label}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    return
  }
  // Mock: open static path or show placeholder
  window.open(storagePath, '_blank')
}

export function TaxDocsPage() {
  useProfileHydration()
  const { taxDocs, loading } = useProfileStore()

  return (
    <div className="space-y-6">
      <PageHeader title="Tax Docs" showBack />

      <div className="flex items-center gap-2">
        <p className="text-body text-[var(--text-muted)] flex-1">
          Monthly and annual statements uploaded by DUBL.
        </p>
        <MockBadge />
      </div>

      {loading && taxDocs.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : taxDocs.length === 0 ? (
        <Card className="text-center py-10 space-y-2">
          <FileText className="mx-auto h-10 w-10 text-[var(--text-muted)]" aria-hidden />
          <p className="text-title">No documents yet</p>
          <p className="text-caption text-[var(--text-muted)]">
            Tax documents appear here when available for your account.
          </p>
        </Card>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {taxDocs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-4">
              <FileText className="h-8 w-8 shrink-0 text-[var(--accent)]" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-body font-semibold truncate">{doc.label}</p>
                <p className="text-caption text-[var(--text-muted)]">
                  Period {doc.period} ·{' '}
                  {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadTaxDoc(doc.storage_path, doc.label)}
                className="shrink-0 rounded-full p-2 text-[var(--accent)] hover:bg-[var(--bg-surface)]"
                aria-label={`Download ${doc.label}`}
              >
                <Download className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
