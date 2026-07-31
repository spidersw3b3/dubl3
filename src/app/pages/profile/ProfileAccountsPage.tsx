import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Toast } from '@/components/Toast'
import { useAuth } from '@/context/AuthProvider'
import { useProfileHydration } from '@/hooks/useProfileHydration'
import type { AddressJson } from '@/lib/types/profile'

export function ProfileAccountsPage() {
  const { profile, updateProfile, user } = useAuth()
  useProfileHydration()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setStateVal] = useState('')
  const [zip, setZip] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username ?? '')
    setDisplayName(profile.display_name ?? '')
    setEmail(profile.email ?? user?.email ?? '')
    setStreet(profile.address_json?.street ?? '')
    setCity(profile.address_json?.city ?? '')
    setStateVal(profile.address_json?.state ?? '')
    setZip(profile.address_json?.zip ?? '')
  }, [profile, user])

  const markDirty = () => setDirty(true)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const address_json: AddressJson = { street, city, state, zip, country: 'US' }
      const initials = (displayName || username).slice(0, 2).toUpperCase()
      await updateProfile({
        username,
        display_name: displayName,
        address_json,
        avatar_initials: initials,
      })
      setDirty(false)
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" showBack />

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); markDirty() }}
          placeholder="Your username"
        />
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); markDirty() }}
        />
        <Input label="Email" type="email" value={email} disabled hint="Contact support to change email" />

        <p className="text-title pt-2">Address</p>
        <Input
          label="Street"
          value={street}
          onChange={(e) => { setStreet(e.target.value); markDirty() }}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={city} onChange={(e) => { setCity(e.target.value); markDirty() }} />
          <Input label="State" value={state} onChange={(e) => { setStateVal(e.target.value); markDirty() }} />
        </div>
        <Input label="ZIP" value={zip} onChange={(e) => { setZip(e.target.value); markDirty() }} />

        <Button type="submit" fullWidth disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </form>

      <Toast message="Profile saved" visible={toast} variant="success" />
    </div>
  )
}
