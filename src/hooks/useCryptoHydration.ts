import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useCryptoStore } from '@/stores/cryptoStore'

/** Load crypto dashboard when user is authenticated */
export function useCryptoHydration() {
  const { user } = useAuth()
  const loadDashboard = useCryptoStore((s) => s.loadDashboard)
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      lastUserId.current = null
      return
    }
    if (lastUserId.current !== user.id) {
      lastUserId.current = user.id
      loadDashboard(user.id)
    }
  }, [user, loadDashboard])
}
