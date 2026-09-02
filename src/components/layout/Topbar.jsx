import { Icon } from '@iconify/react'
import { useMatches } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useMyProfile } from '../../hooks/useMyProfile'
import Dropdown from '../ui/Dropdown'

function getInitials(source) {
  const parts = String(source || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Topbar({ onOpenDrawer }) {
  const { user, logout } = useAuth()
  const { data: profile } = useMyProfile()
  const matches = useMatches()

  const pageTitle =
    [...matches].reverse().find((m) => m.handle?.title)?.handle?.title ?? 'Dashboard'
  const displayName = profile?.fullName || user.email
  const initials = getInitials(profile?.fullName || user.email.split('@')[0])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        >
          <Icon icon="lucide:menu" width="20" height="20" />
        </button>
        <h1 className="font-display text-xl text-primary">{pageTitle}</h1>
      </div>

      <Dropdown
        trigger={
          <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden max-w-[12rem] truncate text-sm font-medium text-text sm:block">
              {displayName}
            </span>
            <Icon icon="lucide:chevron-down" width="16" height="16" className="text-gray-400" />
          </span>
        }
      >
        <div className="border-b border-gray-100 px-3 py-2">
          <p className="truncate text-sm font-medium text-text">{displayName}</p>
          <p className="mt-0.5 text-xs text-gray-500">{user.roleName}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
        >
          <Icon icon="lucide:log-out" width="16" height="16" />
          Log out
        </button>
      </Dropdown>
    </header>
  )
}
