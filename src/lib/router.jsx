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

// Dev-only component gallery. `import.meta.env.DEV` is false in production builds,
// so this branch and its lazy chunk are dropped from the bundle.
const devRoutes = import.meta.env.DEV
  ? [
      {
        path: 'dev/ui',
        handle: { title: 'Component gallery' },
        lazy: () => import('@/dev/ComponentGallery').then((m) => ({ Component: m.default })),
      },
    ]
  : []

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { element: <AppLayout />, children: [...appRoutes, ...devRoutes] },
  ...LEGACY_ROLE_PREFIXES.map((prefix) => ({
    path: `/${prefix}/*`,
    element: <LegacyRoleRedirect />,
  })),
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <NotFoundPage /> },
])

export default router
