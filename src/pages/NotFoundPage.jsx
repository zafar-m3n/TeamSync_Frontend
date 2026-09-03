import { Link } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function NotFoundPage() {
  const { user } = useAuth()
  const to = user ? `/${user.roleName.toLowerCase()}/dashboard` : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-4xl text-primary">Page not found</h1>
      <p className="max-w-sm text-sm text-gray-500">
        We couldn&rsquo;t find that page. It may have moved, or the link might be out
        of date.
      </p>
      <Link
        to={to}
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {user ? 'Back to dashboard' : 'Go to sign in'}
      </Link>
    </div>
  )
}
