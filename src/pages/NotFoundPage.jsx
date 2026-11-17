import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '@/store/useAuth'
import { buttonBase, buttonVariants } from '@/components/ui/buttonStyles'

export default function NotFoundPage() {
  const { user } = useAuth()
  const to = user ? '/dashboard' : '/login'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle text-fg-subtle ring-1 ring-line">
        <Icon icon="lucide:map-pin-off" width="26" height="26" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-display text-sm font-semibold uppercase tracking-wider text-brand-700">404</p>
        <h1 className="text-display text-3xl font-semibold text-fg">Page not found</h1>
        <p className="max-w-sm text-sm text-fg-muted">
          We couldn&rsquo;t find that page. It may have moved, or the link might be out of date.
        </p>
      </div>
      <Link to={to} className={`${buttonBase} ${buttonVariants.primary} h-9 gap-2 rounded-md px-4 text-sm`}>
        <Icon icon="lucide:arrow-left" width="16" height="16" aria-hidden />
        {user ? 'Back to dashboard' : 'Go to sign in'}
      </Link>
    </main>
  )
}
