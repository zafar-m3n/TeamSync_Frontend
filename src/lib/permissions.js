// Permissions and rank numbers come from the server: the session user from /auth/me
// (`permissions`, `roleRank`, `outranksAll`) and `rank` on every role it returns.

export const hasPermission = (user, module, action) =>
  Boolean(user?.permissions?.includes(`${module}.${action}`))

// Admin may act on anyone; everyone else only on users ranked strictly below them.
export const outranks = (user, targetRole) =>
  Boolean(user?.outranksAll) || (targetRole != null && user.roleRank > targetRole.rank)

// roles.manage may assign any role; everyone else only roles ranked strictly below their own.
export const canAssignRole = (user, role) =>
  hasPermission(user, 'roles', 'manage') || user.roleRank > role.rank
