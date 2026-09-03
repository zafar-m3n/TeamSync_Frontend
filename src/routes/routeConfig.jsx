import DashboardPage from '../pages/dashboard/DashboardPage'
import DepartmentsShiftsPage from '../pages/departments-shifts/DepartmentsShiftsPage'
import EmployeeListPage from '../pages/employees/EmployeeListPage'
import EmployeeFormPage from '../pages/employees/EmployeeFormPage'
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage'
import MyProfilePage from '../pages/employees/MyProfilePage'
import UsersPage from '../pages/users/UsersPage'
import RolesPermissionsPage from '../pages/roles-permissions/RolesPermissionsPage'
import MyAttendancePage from '../pages/attendance/MyAttendancePage'
import TeamAttendancePage from '../pages/attendance/TeamAttendancePage'
import AllAttendancePage from '../pages/attendance/AllAttendancePage'
import MyLeavePage from '../pages/leave/MyLeavePage'
import TeamLeavePage from '../pages/leave/TeamLeavePage'
import AllLeavePage from '../pages/leave/AllLeavePage'
import MyGoalsPage from '../pages/goals/MyGoalsPage'
import TeamGoalsPage from '../pages/goals/TeamGoalsPage'
import AllGoalsPage from '../pages/goals/AllGoalsPage'
import MyTrainingPage from '../pages/training/MyTrainingPage'
import ManageTrainingPage from '../pages/training/ManageTrainingPage'
import TrainingPage from '../pages/training/TrainingPage'
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
    path: 'users',
    roles: ['HR', 'Admin'],
    element: <UsersPage />,
    navLabel: 'Users',
    navIcon: 'lucide:user-cog',
    navOrder: 3,
  },
  {
    path: 'roles-permissions',
    roles: ['Admin'],
    element: <RolesPermissionsPage />,
    navLabel: 'Roles & Permissions',
    navIcon: 'lucide:shield-check',
    navOrder: 4,
  },
  {
    path: 'my-attendance',
    roles: SEEDED_ROLES,
    element: <MyAttendancePage />,
    navLabel: 'My Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'team-attendance',
    roles: ['Manager'],
    element: <TeamAttendancePage />,
    navLabel: 'Team Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'attendance',
    roles: ['HR', 'Admin'],
    element: <AllAttendancePage />,
    navLabel: 'Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'my-leave',
    roles: SEEDED_ROLES,
    element: <MyLeavePage />,
    navLabel: 'My Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'team-leave',
    roles: ['Manager'],
    element: <TeamLeavePage />,
    navLabel: 'Team Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'leave',
    roles: ['HR', 'Admin'],
    element: <AllLeavePage />,
    navLabel: 'Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'my-goals',
    roles: SEEDED_ROLES,
    element: <MyGoalsPage />,
    navLabel: 'My Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'team-goals',
    roles: ['Manager'],
    element: <TeamGoalsPage />,
    navLabel: 'Team Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'goals',
    roles: ['HR', 'Admin'],
    element: <AllGoalsPage />,
    navLabel: 'Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'my-training',
    roles: SEEDED_ROLES,
    element: <MyTrainingPage />,
    navLabel: 'My Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
  },
  {
    path: 'manage-training',
    roles: ['Manager'],
    element: <ManageTrainingPage />,
    navLabel: 'Manage Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 9,
  },
  {
    path: 'training',
    roles: ['HR', 'Admin'],
    element: <TrainingPage />,
    navLabel: 'Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
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
