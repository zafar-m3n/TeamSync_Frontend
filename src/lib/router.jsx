import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import ProtectedRoute from '../routes/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import { moduleRoutes, buildRoleRoutes } from '../routes/routeConfig'
import { useAuth } from '../store/AuthContext'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.roleName.toLowerCase()}/dashboard`} replace />
}

const roleRoutes = buildRoleRoutes(moduleRoutes).map(
  ({ path, allowedRoles, element, navLabel }) => ({
    path,
    element: <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>,
    handle: { title: navLabel },
  }),
)

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { element: <AppLayout />, children: roleRoutes },
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
