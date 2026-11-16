import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { RootRedirect, LegacyRoleRedirect } from '@/routes/Redirects'
import AppLayout from '@/components/layout/AppLayout'
import { moduleRoutes } from '@/routes/routeConfig'

const LEGACY_ROLE_PREFIXES = ['admin', 'hr', 'manager', 'employee']

const appRoutes = moduleRoutes.map((route) => ({
  path: route.path,
  element: <ProtectedRoute route={route}>{route.element}</ProtectedRoute>,
  handle: { title: route.navLabel },
}))

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { element: <AppLayout />, children: appRoutes },
  ...LEGACY_ROLE_PREFIXES.map((prefix) => ({
    path: `/${prefix}/*`,
    element: <LegacyRoleRedirect />,
  })),
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <NotFoundPage /> },
])

export default router
