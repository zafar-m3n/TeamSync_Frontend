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
import HolidaysPage from '@/pages/holidays/HolidaysPage'
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
    navGroup: 'admin',
    anyOf: ['departments.create', 'departments.edit', 'departments.delete', 'shifts.manage'],
    element: <DepartmentsShiftsPage />,
    navLabel: 'Departments & Shifts',
    navIcon: 'lucide:building-2',
    navOrder: 1,
  },
  {
    path: 'employees',
    navGroup: 'people',
    anyOf: ['employees.view_all'],
    element: <EmployeeListPage scope="all" />,
    navLabel: 'Employees',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'employees/new',
    title: 'New Employee',
    parent: 'employees',
    anyOf: ['employees.create'],
    element: <EmployeeFormPage mode="create" />,
  },
  {
    path: 'employees/:employeeId',
    title: 'Employee details',
    parent: 'employees',
    anyOf: ['employees.view_all'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'employees/:employeeId/edit',
    title: 'Edit Employee',
    parent: 'employees',
    anyOf: ['employees.edit'],
    element: <EmployeeFormPage mode="edit" />,
  },
  {
    path: 'my-team',
    navGroup: 'people',
    anyOf: ['employees.view_team'],
    element: <EmployeeListPage scope="team" />,
    navLabel: 'My Team',
    navIcon: 'lucide:users',
    navOrder: 2,
  },
  {
    path: 'my-team/:employeeId',
    title: 'Employee details',
    parent: 'my-team',
    anyOf: ['employees.view_team'],
    element: <EmployeeDetailPage />,
  },
  {
    path: 'users',
    navGroup: 'admin',
    anyOf: ['users.view'],
    element: <UsersPage />,
    navLabel: 'Users',
    navIcon: 'lucide:user-cog',
    navOrder: 3,
  },
  {
    path: 'roles-permissions',
    navGroup: 'admin',
    anyOf: ['permissions.view'],
    element: <RolesPermissionsPage />,
    navLabel: 'Roles & Permissions',
    navIcon: 'lucide:shield-check',
    navOrder: 4,
  },
  {
    path: 'my-attendance',
    navGroup: 'time',
    anyOf: ['attendance.view_own'],
    employee: true,
    element: <MyAttendancePage />,
    navLabel: 'My Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'team-attendance',
    navGroup: 'time',
    anyOf: ['attendance.view_team'],
    element: <TeamAttendancePage />,
    navLabel: 'Team Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'attendance',
    navGroup: 'time',
    anyOf: ['attendance.view_all'],
    element: <AllAttendancePage />,
    navLabel: 'Attendance',
    navIcon: 'lucide:calendar-check',
    navOrder: 5,
  },
  {
    path: 'my-leave',
    navGroup: 'time',
    anyOf: ['leave.view_own'],
    employee: true,
    element: <MyLeavePage />,
    navLabel: 'My Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'team-leave',
    navGroup: 'time',
    anyOf: ['leave.view_team'],
    element: <TeamLeavePage />,
    navLabel: 'Team Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'leave',
    navGroup: 'time',
    anyOf: ['leave.view_all'],
    element: <AllLeavePage />,
    navLabel: 'Leave',
    navIcon: 'lucide:calendar-days',
    navOrder: 6,
  },
  {
    path: 'holidays',
    navGroup: 'time',
    anyOf: ['holidays.manage'],
    element: <HolidaysPage />,
    navLabel: 'Holidays',
    navIcon: 'lucide:calendar-heart',
    navOrder: 6.5,
  },
  {
    path: 'my-goals',
    navGroup: 'growth',
    anyOf: ['goals.view_own'],
    employee: true,
    element: <MyGoalsPage />,
    navLabel: 'My Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'team-goals',
    navGroup: 'growth',
    anyOf: ['goals.view_team'],
    element: <TeamGoalsPage />,
    navLabel: 'Team Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'goals',
    navGroup: 'growth',
    anyOf: ['goals.view_all'],
    element: <AllGoalsPage />,
    navLabel: 'Goals',
    navIcon: 'lucide:target',
    navOrder: 7,
  },
  {
    path: 'my-training',
    navGroup: 'growth',
    anyOf: ['training.view_assigned'],
    employee: true,
    element: <MyTrainingPage />,
    navLabel: 'My Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
  },
  {
    path: 'manage-training',
    navGroup: 'growth',
    anyOf: ['training.upload', 'training.assign', 'training.view_own_uploads'],
    element: <ManageTrainingPage />,
    navLabel: 'Manage Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 9,
  },
  {
    path: 'training',
    navGroup: 'growth',
    anyOf: ['training.view_all'],
    element: <TrainingPage />,
    navLabel: 'Training',
    navIcon: 'lucide:graduation-cap',
    navOrder: 8,
  },
  {
    path: 'my-profile',
    title: 'My Profile',
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
      group: r.navGroup ?? null,
    }))
}

// Sidebar sections, in display order. Items without a group (Dashboard) come first.
export const NAV_GROUPS = [
  { key: 'people', label: 'People' },
  { key: 'time', label: 'Time & leave' },
  { key: 'growth', label: 'Growth' },
  { key: 'admin', label: 'Admin' },
]

// Permitted nav items split into sections; empty sections are dropped.
export function buildNavSections(routes, user) {
  const items = buildNavItems(routes, user)
  return [
    { key: 'main', label: null, items: items.filter((i) => !i.group) },
    ...NAV_GROUPS.map((g) => ({ ...g, items: items.filter((i) => i.group === g.key) })),
  ].filter((section) => section.items.length > 0)
}

const routeByPath = Object.fromEntries(moduleRoutes.map((r) => [r.path, r]))

// Page title for the topbar, plus an optional parent crumb ({ label, path }).
export function routeTitle(route) {
  const title = route.title ?? route.navLabel ?? 'TeamSync'
  const parentRoute = route.parent ? routeByPath[route.parent] : null
  const parent = parentRoute ? { label: parentRoute.navLabel, path: `/${parentRoute.path}` } : null
  return { title, parent }
}
