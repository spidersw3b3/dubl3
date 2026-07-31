import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/adminApi'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { AdminConfirmDialog } from '@/admin/components/AdminConfirmDialog'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import type { OddsConfigView } from '@/lib/types/admin'

export function AdminDoubleEnginePage() {
  const { user } = useAdminAuth()
  const [config, setConfig] = useState<OddsConfigView | null>(null)
  const [mode, setMode] = useState('bonus_only')
  const [winProb, setWinProb] = useState('0.4')
  const [dailyMax, setDailyMax] = useState('25')
  const [singleMax, setSingleMax] = useState('200')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    void adminApi.getOddsConfig().then((c) => {
      setConfig(c)
      setMode(c.mode)
      setWinProb(String(c.base_win_probability))
      setDailyMax(String(c.max_daily_double_usd))
      setSingleMax(String(c.max_single_double_usd))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (reason: string) => {
    if (!user) return
    setSaving(true)
    setMessage(null)
    try {
      await adminApi.updateOddsConfig(
        user,
        {
          mode,
          base_win_probability: parseFloat(winProb),
          max_daily_double_usd: parseFloat(dailyMax),
          max_single_double_usd: parseFloat(singleMax),
        },
        reason,
      )
      setMessage('Odds config updated — applies to new double flips in mock mode')
      setConfirmOpen(false)
      load()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-heading">Double Engine</h1>
        <p className="text-body text-[var(--text-muted)]">Admin-configurable odds (MVP: bonus_only @ 40%)</p>
      </div>

      {loading || !config ? (
        <p className="text-body text-[var(--text-muted)]">Loading config…</p>
      ) : (
        <Card variant="elevated" className="max-w-lg space-y-4">
          <p className="text-caption text-[var(--text-muted)]">
            Last updated {new Date(config.updated_at).toLocaleString()}
            {config.updated_by ? ` by ${config.updated_by}` : ''}
          </p>

          <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="bonus_only">bonus_only</option>
            <option value="split_payment">split_payment</option>
            <option value="tiered">tiered</option>
            <option value="partner_boost">partner_boost</option>
          </Select>

          <Input
            label="Base win probability (0–1)"
            inputMode="decimal"
            value={winProb}
            onChange={(e) => setWinProb(e.target.value)}
          />
          <Input
            label="Max daily double USD"
            inputMode="decimal"
            value={dailyMax}
            onChange={(e) => setDailyMax(e.target.value)}
          />
          <Input
            label="Max single double USD"
            inputMode="decimal"
            value={singleMax}
            onChange={(e) => setSingleMax(e.target.value)}
          />

          <Button fullWidth onClick={() => setConfirmOpen(true)}>Save changes</Button>
          {message && <p className="text-caption text-[var(--accent)]">{message}</p>}
        </Card>
      )}

      <AdminConfirmDialog
        open={confirmOpen}
        title="Update Double Engine config"
        description="Changes affect new double flips. Reason is logged to audit."
        confirmLabel="Save"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSave}
      />
    </div>
  )
}
