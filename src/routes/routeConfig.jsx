import DashboardPage from '../pages/dashboard/DashboardPage'
import DepartmentsShiftsPage from '../pages/departments-shifts/DepartmentsShiftsPage'
import EmployeeListPage from '../pages/employees/EmployeeListPage'
import EmployeeFormPage from '../pages/employees/EmployeeFormPage'
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage'
import MyProfilePage from '../pages/employees/MyProfilePage'
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
  {
    path: 'employees',
    roles: ['HR', 'Admin'],
    element: <EmployeeListPage scope="all" />,
    navLabel: 'Employees',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'employees/new',
    roles: ['HR', 'Admin'],
    element: <EmployeeFormPage mode="create" />,
  },
  {
    path: 'employees/:employeeId',
    roles: ['HR', 'Admin'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'employees/:employeeId/edit',
    roles: ['HR', 'Admin'],
    element: <EmployeeFormPage mode="edit" />,
  },
  {
    path: 'my-team',
    roles: ['Manager'],
    element: <EmployeeListPage scope="team" />,
    navLabel: 'My Team',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'my-team/:employeeId',
    roles: ['Manager'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'my-profile',
    roles: SEEDED_ROLES,
    element: <MyProfilePage />,
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
    .filter((r) => r.navLabel && r.roles.includes(roleName))
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((r) => ({
      path: `/${roleName.toLowerCase()}/${r.path}`,
      label: r.navLabel,
      icon: r.navIcon,
    }))
}
