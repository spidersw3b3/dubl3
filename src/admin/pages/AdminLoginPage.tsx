import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAdminAuth } from '@/admin/context/AdminAuthProvider'
import { ADMIN_CREDENTIALS } from '@/lib/api/adminMockApi'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dubl-admin-7k2m9', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <div>
          <h1 className="text-heading">DUBL Admin</h1>
          <p className="text-caption text-[var(--text-muted)]">Obfuscated ops console — not linked from player UI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-caption text-[var(--danger)]">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-caption text-[var(--text-muted)]">
          Dev: {ADMIN_CREDENTIALS.email} / {ADMIN_CREDENTIALS.password}
        </p>
      </div>
    </div>
  )
}
