import {
  Bell,
  Box,
  FileText,
  Lock,
  Moon,
  Settings,
  User,
} from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Avatar } from '@/components/Avatar'
import { HubMenuList } from '@/components/HubMenuList'
import { SegmentedToggle } from '@/components/SegmentedToggle'
import { useAuth } from '@/context/AuthProvider'

const hubItems = [
  { to: '/profile/accounts', icon: <User className="h-5 w-5" />, title: 'Accounts', subtitle: 'Manage your personal info' },
  { to: '/profile/dubls', icon: <Box className="h-5 w-5" />, title: 'Dubls', subtitle: 'View your won doubles' },
  { to: '/profile/tax-docs', icon: <FileText className="h-5 w-5" />, title: 'Tax Docs', subtitle: 'View and download documents' },
  { to: '/profile/settings', icon: <Settings className="h-5 w-5" />, title: 'Settings', subtitle: 'App preferences' },
  { to: '/profile/privacy', icon: <Lock className="h-5 w-5" />, title: 'Privacy', subtitle: 'Control your privacy' },
  { to: '/profile/notifications', icon: <Bell className="h-5 w-5" />, title: 'Notifications', subtitle: 'Manage alerts' },
  { to: '/profile/appearance', icon: <Moon className="h-5 w-5" />, title: 'Appearance', subtitle: 'Theme and colors' },
]

export function ProfilePage() {
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isSubRoute = location.pathname !== '/profile'

  if (isSubRoute) {
    return <Outlet />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading">Profile</h1>
        <Avatar initials={profile?.avatar_initials ?? '??'} size="lg" />
      </div>

      <SegmentedToggle
        options={[
          { value: 'hub' as const, label: 'Hub' },
          { value: 'settings' as const, label: 'Settings' },
        ]}
        value="hub"
        onChange={(v) => {
          if (v === 'settings') navigate('/profile/settings')
        }}
        className="w-full flex"
      />

      <HubMenuList items={hubItems} />
    </div>
  )
}
