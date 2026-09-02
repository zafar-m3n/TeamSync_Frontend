import DashboardPage from '../pages/dashboard/DashboardPage'
import DepartmentsShiftsPage from '../pages/departments-shifts/DepartmentsShiftsPage'
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
  {
    path: 'departments-shifts',
    roles: ['HR', 'Admin'],
    element: <DepartmentsShiftsPage />,
    navLabel: 'Departments & Shifts',
    navIcon: 'lucide:building-2',
    navOrder: 1,
  },
]

export function buildRoleRoutes(routes) {
  return routes.flatMap(({ path, roles, element, navLabel }) =>
    roles.map((role) => ({
      path: `/${role.toLowerCase()}/${path}`,
      allowedRoles: [role],
      element,
      navLabel,
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
