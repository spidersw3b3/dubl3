import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useProfileStore } from '@/stores/profileStore'

export function useProfileHydration() {
  const { user, profile } = useAuth()
  const load = useProfileStore((s) => s.load)
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      lastUserId.current = null
      return
    }
    if (lastUserId.current !== user.id) {
      lastUserId.current = user.id
      load(user.id, profile?.is_test_account ?? false)
    }
  }, [user, profile?.is_test_account, load])
}
