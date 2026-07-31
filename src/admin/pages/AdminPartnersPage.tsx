import { useEffect, useState } from 'react'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { partnerApi } from '@/lib/api/partnerApi'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { AdminConfirmDialog } from '@/admin/components/AdminConfirmDialog'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DataTable } from '@/components/DataTable'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { Toggle } from '@/components/Toggle'
import { formatUsd } from '@/lib/formatters'
import type { PartnerBrand, SubsidyBurnReport, UpsertPartnerParams } from '@/lib/types/partner'

const emptyForm: UpsertPartnerParams = {
  name: '',
  slug: '',
  merchant_tags: [],
  boosted_win_probability: 0.5,
  subsidy_cap: 1000,
  active: true,
}

export function AdminPartnersPage() {
  const { user } = useAdminAuth()
  const [partners, setPartners] = useState<PartnerBrand[]>([])
  const [report, setReport] = useState<SubsidyBurnReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PartnerBrand | null>(null)
  const [form, setForm] = useState<UpsertPartnerParams>(emptyForm)
  const [tagsInput, setTagsInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<PartnerBrand | null>(null)
  const [confirmSave, setConfirmSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [p, r] = await Promise.all([
        partnerApi.listAll(),
        partnerApi.getSubsidyReport(),
      ])
      setPartners(p)
      setReport(r)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setTagsInput('')
    setFormOpen(true)
  }

  const openEdit = (partner: PartnerBrand) => {
    setEditing(partner)
    setForm({
      name: partner.name,
      slug: partner.slug,
      merchant_tags: partner.merchant_tags,
      boosted_win_probability: partner.boosted_win_probability,
      subsidy_cap: partner.subsidy_cap,
      active: partner.active,
    })
    setTagsInput(partner.merchant_tags.join(', '))
    setFormOpen(true)
  }

  const handleSave = async (reason: string) => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        merchant_tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      }
      if (editing) {
        await partnerApi.update(editing.id, payload)
      } else {
        await partnerApi.create(payload)
      }
      setConfirmSave(false)
      setFormOpen(false)
      await load()
      void reason
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (reason: string) => {
    if (!confirmDelete) return
    setSaving(true)
    try {
      await partnerApi.delete(confirmDelete.id)
      setConfirmDelete(null)
      await load()
      void reason
    } finally {
      setSaving(false)
    }
  }

  const exportSubsidy = async () => {
    const r = report ?? await partnerApi.getSubsidyReport()
    const csv = partnerApi.exportSubsidyCsv(r)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dubl-subsidy-burn-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-heading">Partner Boosts</h1>
          <p className="text-body text-[var(--text-muted)]">
            CRUD partner brands · merchant tag → boosted win probability · subsidy burn
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void exportSubsidy()}>
            <Download className="h-4 w-4 mr-1" />
            Subsidy CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add partner
          </Button>
        </div>
      </div>

      {report && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card variant="elevated">
            <p className="text-caption text-[var(--text-muted)]">Total subsidy burned</p>
            <p className="text-title font-bold">{formatUsd(report.total_burned)}</p>
          </Card>
          <Card variant="elevated">
            <p className="text-caption text-[var(--text-muted)]">Active partners</p>
            <p className="text-title font-bold">{partners.filter((p) => p.active).length}</p>
          </Card>
          <Card variant="elevated">
            <p className="text-caption text-[var(--text-muted)]">Burn events</p>
            <p className="text-title font-bold">
              {report.partners.reduce((n, p) => n + p.events.length, 0)}
            </p>
          </Card>
        </div>
      )}

      {loading ? (
        <p className="text-body text-[var(--text-muted)]">Loading partners…</p>
      ) : (
        <DataTable
          rows={partners}
          rowKey={(p) => p.id}
          emptyMessage="No partners configured"
          columns={[
            { key: 'name', header: 'Brand', render: (p) => p.name },
            { key: 'slug', header: 'Slug', render: (p) => p.slug },
            {
              key: 'boost',
              header: 'Boost',
              render: (p) => `${Math.round(p.boosted_win_probability * 100)}%`,
            },
            {
              key: 'subsidy',
              header: 'Subsidy',
              render: (p) => `${formatUsd(p.subsidy_used)} / ${formatUsd(p.subsidy_cap)}`,
            },
            {
              key: 'tags',
              header: 'Tags',
              render: (p) => p.merchant_tags.join(', ') || '—',
            },
            {
              key: 'active',
              header: 'Active',
              render: (p) => (p.active ? 'Yes' : 'No'),
            },
            {
              key: 'actions',
              header: '',
              render: (p) => (
                <div className="flex gap-2">
                  <button type="button" aria-label="Edit" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4 text-[var(--accent)]" />
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => setConfirmDelete(p)}>
                    <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {report && report.partners.some((p) => p.events.length > 0) && (
        <section className="space-y-2">
          <h2 className="text-body font-semibold">Recent subsidy burn</h2>
          <DataTable
            rows={report.partners.flatMap((p) => p.events).slice(0, 15)}
            rowKey={(e) => e.id}
            emptyMessage="No burn events"
            columns={[
              { key: 'partner', header: 'Partner', render: (e) => e.partner_name },
              { key: 'merchant', header: 'Merchant', render: (e) => e.merchant_name },
              { key: 'subsidy', header: 'Burned', render: (e) => formatUsd(e.subsidy_amount) },
              { key: 'prob', header: 'Win %', render: (e) => `${Math.round(e.win_probability_used * 100)}%` },
              { key: 'at', header: 'When', render: (e) => new Date(e.created_at).toLocaleString() },
            ]}
          />
        </section>
      )}

      <Modal
        open={formOpen}
        title={editing ? 'Edit partner' : 'Add partner'}
        onClose={() => setFormOpen(false)}
      >
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input
            label="Merchant tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            hint="Matched against Pay modal merchant name (case-insensitive)"
          />
          <Input
            label="Boosted win probability (0–1)"
            inputMode="decimal"
            value={String(form.boosted_win_probability)}
            onChange={(e) => setForm({ ...form, boosted_win_probability: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Subsidy cap USD"
            inputMode="decimal"
            value={String(form.subsidy_cap)}
            onChange={(e) => setForm({ ...form, subsidy_cap: parseFloat(e.target.value) || 0 })}
          />
          <div className="flex items-center justify-between">
            <span className="text-body">Active</span>
            <Toggle checked={form.active ?? true} onChange={(v) => setForm({ ...form, active: v })} />
          </div>
          {error && <p className="text-caption text-[var(--danger)]">{error}</p>}
          <Button fullWidth onClick={() => setConfirmSave(true)}>Save</Button>
        </div>
      </Modal>

      <AdminConfirmDialog
        open={confirmSave}
        title={editing ? 'Update partner' : 'Create partner'}
        description="Partner changes affect checkout boost matching and subsidy caps."
        confirmLabel="Save"
        loading={saving}
        onCancel={() => setConfirmSave(false)}
        onConfirm={handleSave}
      />

      <AdminConfirmDialog
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.name ?? 'partner'}`}
        description="Removes partner boost rules. Existing burn events remain in report history (mock)."
        confirmLabel="Delete"
        loading={saving}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
