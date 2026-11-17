import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { canAccessRoute } from '@/routes/routeConfig'
import ForbiddenPage from '@/pages/ForbiddenPage'

export default function ProtectedRoute({ route, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  // Direct URL access without the permission: a 403 state inside the app shell.
  if (!canAccessRoute(route, user)) return <ForbiddenPage />

  return children
}
