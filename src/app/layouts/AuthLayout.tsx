import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <Outlet />
    </div>
  )
}
