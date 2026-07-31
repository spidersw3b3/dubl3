import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { DublLogo } from '@/components/DublLogo'
import { useAuth } from '@/context/AuthProvider'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-8">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-caption text-[var(--text-muted)]">
        ← Back
      </Link>

      <div className="mb-8 flex flex-col items-center">
        <DublLogo className="h-12 w-12" />
        <h1 className="mt-4 text-heading">Welcome back</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-caption text-[var(--danger)]">{error}</p>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Signing in…' : 'Login'}
        </Button>
      </form>

      <p className="mt-6 text-center text-body text-[var(--text-muted)]">
        No account?{' '}
        <Link to="/signup" className="text-[var(--accent)] font-semibold">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
