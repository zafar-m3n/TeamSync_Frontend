import DashboardPage from '../pages/dashboard/DashboardPage'
import { SEEDED_ROLES } from '../lib/permissions'

export const moduleRoutes = [
  {
    path: 'dashboard',
    roles: SEEDED_ROLES,
    element: <DashboardPage />,
    navLabel: 'Dashboard',
    navIcon: 'lucide:layout-dashboard',
    navOrder: 0,
  },
]

export function buildRoleRoutes(routes) {
  return routes.flatMap(({ path, roles, element }) =>
    roles.map((role) => ({
      path: `/${role.toLowerCase()}/${path}`,
      allowedRoles: [role],
      element,
    })),
  )
}

export function buildNavItems(routes, roleName) {
  return routes
    .filter((r) => r.roles.includes(roleName))
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((r) => ({
      path: `/${roleName.toLowerCase()}/${r.path}`,
      label: r.navLabel,
      icon: r.navIcon,
    }))
}
