// Permissions and rank numbers come from the server: the session user from /auth/me
// (`permissions`, `roleRank`, `outranksAll`) and `rank` on every role it returns.

export const hasPermission = (user, module, action) =>
  Boolean(user?.permissions?.includes(`${module}.${action}`))

// keys are "module.action" strings.
export const hasAnyPermission = (user, keys) => keys.some((key) => user?.permissions?.includes(key))

// Admin may act on anyone; everyone else only on users ranked strictly below them.
export const outranks = (user, targetRole) =>
  Boolean(user?.outranksAll) || (targetRole != null && user.roleRank > targetRole.rank)

// roles.manage may assign any role; everyone else only roles ranked strictly below their own.
export const canAssignRole = (user, role) =>
  hasPermission(user, 'roles', 'manage') || user.roleRank > role.rank

// A manager deletes goals of their current direct reports (matching the backend, where
// every goal action follows the employee's current manager); goals.view_all deletes any.
export const canDeleteGoal = (user, goal) =>
  hasPermission(user, 'goals', 'delete') &&
  (hasPermission(user, 'goals', 'view_all') ||
    (user.employeeId != null && goal.employee?.managerId === user.employeeId))
