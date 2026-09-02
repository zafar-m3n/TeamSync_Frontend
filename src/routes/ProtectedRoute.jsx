import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.roleName)) {
    return <Navigate to={`/${user.roleName.toLowerCase()}/dashboard`} replace />
  }

  return children
}
