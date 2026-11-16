import DashboardPage from '@/pages/dashboard/DashboardPage'
import DepartmentsShiftsPage from '@/pages/departments-shifts/DepartmentsShiftsPage'
import EmployeeListPage from '@/pages/employees/EmployeeListPage'
import EmployeeFormPage from '@/pages/employees/EmployeeFormPage'
import EmployeeDetailPage from '@/pages/employees/EmployeeDetailPage'
import MyProfilePage from '@/pages/employees/MyProfilePage'
import UsersPage from '@/pages/users/UsersPage'
import RolesPermissionsPage from '@/pages/roles-permissions/RolesPermissionsPage'
import MyAttendancePage from '@/pages/attendance/MyAttendancePage'
import TeamAttendancePage from '@/pages/attendance/TeamAttendancePage'
import AllAttendancePage from '@/pages/attendance/AllAttendancePage'
import MyLeavePage from '@/pages/leave/MyLeavePage'
import TeamLeavePage from '@/pages/leave/TeamLeavePage'
import AllLeavePage from '@/pages/leave/AllLeavePage'
import MyGoalsPage from '@/pages/goals/MyGoalsPage'
import TeamGoalsPage from '@/pages/goals/TeamGoalsPage'
import AllGoalsPage from '@/pages/goals/AllGoalsPage'
import MyTrainingPage from '@/pages/training/MyTrainingPage'
import ManageTrainingPage from '@/pages/training/ManageTrainingPage'
import TrainingPage from '@/pages/training/TrainingPage'
import { hasAnyPermission } from '@/lib/permissions'

// `anyOf`: the user needs at least one of these permissions.
// `employee`: the page shows the user's own records, so it needs an employee profile.
export const moduleRoutes = [
  {
    path: 'dashboard',
    element: <DashboardPage />,
    navLabel: 'Dashboard',
    navIcon: 'lucide:layout-dashboard',
    navOrder: 0,
  },
  {
    path: 'departments-shifts',
    anyOf: ['departments.create', 'departments.edit', 'departments.delete', 'shifts.manage'],
    element: <DepartmentsShiftsPage />,
    navLabel: 'Departments & Shifts',
    navIcon: 'lucide:building-2',
    navOrder: 1,
  },
  {
    path: 'employees',
    anyOf: ['employees.view_all'],
    element: <EmployeeListPage scope="all" />,
    navLabel: 'Employees',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'employees/new',
    anyOf: ['employees.create'],
    element: <EmployeeFormPage mode="create" />,
  },
  {
    path: 'employees/:employeeId',
    anyOf: ['employees.view_all'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'employees/:employeeId/edit',
    anyOf: ['employees.edit'],
    element: <EmployeeFormPage mode="edit" />,
  },
  {
    path: 'my-team',
    anyOf: ['employees.view_team'],
    element: <EmployeeListPage scope="team" />,
    navLabel: 'My Team',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'my-team/:employeeId',
    anyOf: ['employees.view_team'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'users',
    anyOf: ['users.view'],
    element: <UsersPage />,
    navLabel: 'Users',
    navIcon: 'lucide:user-cog',
    navOrder: 3,
  },
  {
    path: 'roles-permissions',
    anyOf: ['permissions.view'],
    element: <RolesPermissionsPage />,
    navLabel: 'Roles & Permissions',
    navIcon: 'lucide:shield-check',
    navOrder: 4,
  },
  {
    path: 'my-attendance',
    anyOf: ['attendance.view_own'],
    employee: true,
    element: <MyAttendancePage />,
    navLabel: 'My Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'team-attendance',
    anyOf: ['attendance.view_team'],
    element: <TeamAttendancePage />,
    navLabel: 'Team Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'attendance',
    anyOf: ['attendance.view_all'],
    element: <AllAttendancePage />,
    navLabel: 'Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'my-leave',
    anyOf: ['leave.view_own'],
    employee: true,
    element: <MyLeavePage />,
    navLabel: 'My Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'team-leave',
    anyOf: ['leave.view_team'],
    element: <TeamLeavePage />,
    navLabel: 'Team Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'leave',
    anyOf: ['leave.view_all'],
    element: <AllLeavePage />,
    navLabel: 'Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'my-goals',
    anyOf: ['goals.view_own'],
    employee: true,
    element: <MyGoalsPage />,
    navLabel: 'My Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'team-goals',
    anyOf: ['goals.view_team'],
    element: <TeamGoalsPage />,
    navLabel: 'Team Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'goals',
    anyOf: ['goals.view_all'],
    element: <AllGoalsPage />,
    navLabel: 'Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'my-training',
    anyOf: ['training.view_assigned'],
    employee: true,
    element: <MyTrainingPage />,
    navLabel: 'My Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
  },
  {
    path: 'manage-training',
    anyOf: ['training.upload', 'training.assign', 'training.view_own_uploads'],
    element: <ManageTrainingPage />,
    navLabel: 'Manage Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 9,
  },
  {
    path: 'training',
    anyOf: ['training.view_all'],
    element: <TrainingPage />,
    navLabel: 'Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
  },
  {
    path: 'my-profile',
    anyOf: ['employees.view_own'],
    element: <MyProfilePage />,
  },
]

export const canAccessRoute = (route, user) =>
  (!route.anyOf || hasAnyPermission(user, route.anyOf)) &&
  (!route.employee || user?.employeeId != null)

// Sidebar-only label overrides. The route's navLabel still drives the Topbar
// page title; only the nav item text changes here.
const SIDEBAR_LABEL_OVERRIDES = {
  Goals: 'Performance Goals',
  Training: 'Training Documents',
}

export function buildNavItems(routes, user) {
  return routes
    .filter((r) => r.navLabel && canAccessRoute(r, user))
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((r) => ({
      path: `/${r.path}`,
      label: SIDEBAR_LABEL_OVERRIDES[r.navLabel] ?? r.navLabel,
      icon: r.navIcon,
    }))
}
