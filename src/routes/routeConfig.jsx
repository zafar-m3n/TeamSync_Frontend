import DashboardPage from '../pages/dashboard/DashboardPage'
import { SEEDED_ROLES } from '../lib/permissions'

export const moduleRoutes = [
  { path: 'dashboard', roles: SEEDED_ROLES, element: <DashboardPage /> },
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
