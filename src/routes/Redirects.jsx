import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'

export function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

// URLs used to carry the role (/hr/employees); old bookmarks drop the prefix.
export function LegacyRoleRedirect() {
  const { '*': rest } = useParams()
  const { search, hash } = useLocation()
  return <Navigate to={`/${rest}${search}${hash}`} replace />
}
