import { useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { useSocialStore } from '@/stores/socialStore'

export function useSocialHydration() {
  const { user, profile } = useAuth()
  const { hydrated, load } = useSocialStore()

  useEffect(() => {
    if (!user || hydrated) return
    void load(user.id, profile?.referral_code ?? 'REF', profile?.is_test_account)
  }, [user, profile, hydrated, load])
}
