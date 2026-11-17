import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { canAccessRoute } from '@/routes/routeConfig'

export default function ProtectedRoute({ route, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (!canAccessRoute(route, user)) return <Navigate to="/dashboard" replace />

  return children
}
