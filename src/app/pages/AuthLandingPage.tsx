import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { DublLogo } from '@/components/DublLogo'
import { useAuth } from '@/context/AuthProvider'

const devSeedEnabled = import.meta.env.VITE_DEV_SEED_ENABLED === 'true'

export function AuthLandingPage() {
  const { devSeedLogin } = useAuth()
  const navigate = useNavigate()

  const handleDevSeed = async () => {
    await devSeedLogin()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center pt-[15vh]">
        <DublLogo className="h-12 w-20 text-[var(--accent)]" />
        <h1 className="mt-6 text-display-l tracking-[0.35em] font-bold">DUBL</h1>
      </div>

      <div className="flex flex-col gap-3 pb-[20vh]">
        <Link to="/login">
          <Button variant="outline" fullWidth size="lg">
            Login
          </Button>
        </Link>
        <Link to="/signup">
          <Button fullWidth size="lg">
            Sign Up
          </Button>
        </Link>
      </div>

      <footer className="pb-8 text-center">
        <p className="text-caption text-[var(--text-muted)] tracking-widest">DUBL</p>
        {devSeedEnabled && (
          <button
            type="button"
            onClick={handleDevSeed}
            className="mt-4 text-caption text-[var(--accent)] underline underline-offset-2"
          >
            Dev: Sign in as test@dubl.app
          </button>
        )}
      </footer>
    </div>
  )
}
