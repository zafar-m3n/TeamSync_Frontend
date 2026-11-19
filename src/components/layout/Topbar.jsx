import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Link, useMatches } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useMyProfile } from '@/hooks/useMyProfile'
import { moduleRoutes, canAccessRoute } from '@/routes/routeConfig'
import { selectSetMobileNavOpen, useLayoutStore } from '@/store/ui/layoutStore'
import Menu from '@/components/ui/Menu'
import ClockStatusPill from '@/components/layout/ClockStatusPill'
import ThemeToggle from '@/components/layout/ThemeToggle'

function getInitials(source) {
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const myAttendanceRoute = moduleRoutes.find((r) => r.path === 'my-attendance')

export default function Topbar() {
  const { user, logout, can } = useAuth()
  const { data: profile } = useMyProfile()
  const setMobileNavOpen = useLayoutStore(selectSetMobileNavOpen)
  const matches = useMatches()

  const handle = [...matches].reverse().find((m) => m.handle?.title)?.handle
  const pageTitle = handle?.title ?? 'TeamSync'
  const parent = handle?.parent
  const displayName = profile?.fullName || user.email
  const initials = getInitials(profile?.fullName || user.email.split('@')[0])
  const canViewProfile = can('employees', 'view_own')
  const showClock = can('attendance', 'clock') && user.employeeId != null
  const clockLink = myAttendanceRoute && canAccessRoute(myAttendanceRoute, user) ? '/my-attendance' : '/dashboard'

  useEffect(() => {
    document.title = pageTitle === 'TeamSync' ? 'TeamSync' : `${pageTitle} · TeamSync`
    return () => {
      document.title = 'TeamSync'
    }
  }, [pageTitle])

  const menuItems = [
    ...(canViewProfile
      ? [
          { key: 'profile', label: 'My profile', icon: 'lucide:user-round', to: '/my-profile' },
          { key: 'password', label: 'Change password', icon: 'lucide:key-round', to: '/my-profile#change-password' },
        ]
      : []),
    { key: 'logout', label: 'Log out', icon: 'lucide:log-out', onSelect: logout, tone: 'danger' },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/75 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
          className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:focus-ring lg:hidden"
        >
          <Icon icon="lucide:menu" width="20" height="20" aria-hidden />
        </button>
        <div className="flex min-w-0 items-center gap-1.5">
          {parent && (
            <>
              <Link
                to={parent.path}
                className="hidden shrink-0 rounded text-sm text-fg-muted transition-colors hover:text-fg focus-visible:focus-ring sm:inline"
              >
                {parent.label}
              </Link>
              <Icon icon="lucide:chevron-right" width="14" height="14" aria-hidden className="hidden shrink-0 text-fg-subtle sm:block" />
            </>
          )}
          <h1 className="text-display truncate text-xl font-semibold text-fg sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ClockStatusPill enabled={showClock} to={clockLink} />
        <ThemeToggle />
        <Menu
          label="Account menu"
          items={menuItems}
          triggerClassName="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-hover"
          trigger={
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg text-xs font-semibold text-surface">
                {initials}
              </span>
              <span className="hidden max-w-48 truncate text-sm font-medium text-fg sm:block">{displayName}</span>
              <Icon icon="lucide:chevron-down" width="16" height="16" aria-hidden className="text-fg-subtle" />
            </>
          }
          header={
            <>
              <p className="truncate text-sm font-medium text-fg">{displayName}</p>
              <p className="truncate text-cell text-fg-muted">{user.roleName}</p>
            </>
          }
        />
      </div>
    </header>
  )
}
