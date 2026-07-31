import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { DublLogo } from '@/components/DublLogo'
import { useAuth } from '@/context/AuthProvider'

export function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref') ?? undefined
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signUp(email, password, username || undefined, referralCode)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
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
        <h1 className="mt-4 text-heading">Create account</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          autoComplete="username"
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters"
          required
          minLength={8}
        />
        {referralCode && (
          <p className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-caption text-[var(--text-muted)]">
            Referred by code <span className="font-mono font-semibold text-[var(--text-primary)]">{referralCode}</span>
          </p>
        )}
        {error && <p className="text-caption text-[var(--danger)]">{error}</p>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <p className="mt-6 text-center text-body text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--accent)] font-semibold">
          Login
        </Link>
      </p>
    </div>
  )
}
