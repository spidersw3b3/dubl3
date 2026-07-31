import { Outlet } from 'react-router'
import { BottomNav } from '@/components/BottomNav'
import { useSwipeBack } from '@/hooks/useSwipeBack'

export function AppShell() {
  useSwipeBack()

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
