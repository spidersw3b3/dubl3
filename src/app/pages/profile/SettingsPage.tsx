import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'
import { Toast } from '@/components/Toast'
import { useAuth } from '@/context/AuthProvider'
import { useProfileHydration } from '@/hooks/useProfileHydration'
import { useProfileStore } from '@/stores/profileStore'

export function SettingsPage() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  useProfileHydration()

  const { appSettings, saveAppSettings, loading } = useProfileStore()
  const [language, setLanguage] = useState(appSettings.language)
  const [currency, setCurrency] = useState(appSettings.currency)
  const [paymentMethod, setPaymentMethod] = useState(appSettings.default_payment_method)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    setLanguage(appSettings.language)
    setCurrency(appSettings.currency)
    setPaymentMethod(appSettings.default_payment_method)
  }, [appSettings])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveAppSettings(user.id, {
        language,
        currency,
        default_payment_method: paymentMethod,
      })
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" showBack />

      <div className="space-y-4">
        <Select
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </Select>

        <Select
          label="Currency display"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </Select>

        <Select
          label="Default payment method"
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value as typeof paymentMethod)
          }
        >
          <option value="balance">DUBL Balance</option>
          <option value="debit">DUBL Visa Debit</option>
          <option value="credit_line">Double Credit Line</option>
        </Select>

        <Button fullWidth disabled={loading || saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>

      <Button variant="outline" fullWidth onClick={handleSignOut}>
        Sign Out
      </Button>

      <Toast message="Settings saved" visible={toast} variant="success" />
    </div>
  )
}
