import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import { canAccessRoute } from '@/routes/routeConfig'

export default function ProtectedRoute({ route, children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />

  if (!canAccessRoute(route, user)) return <Navigate to="/dashboard" replace />

  return children
}
