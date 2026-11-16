export const PERMISSION_MATRIX = [
  { module: "employees", action: "create", roles: ["HR", "Admin"] },
  { module: "employees", action: "edit", roles: ["HR", "Admin"] },
  { module: "employees", action: "delete", roles: ["HR", "Admin"] },
  { module: "employees", action: "view_own", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "employees", action: "view_team", roles: ["Manager"] },
  { module: "employees", action: "view_all", roles: ["HR", "Admin"] },

  { module: "shifts", action: "manage", roles: ["HR", "Admin"] },
  { module: "shifts", action: "assign", roles: ["HR", "Admin"] },
  { module: "attendance", action: "edit", roles: ["HR", "Admin"] },
  { module: "attendance", action: "override", roles: ["HR", "Admin", "Manager"] },
  { module: "attendance", action: "view_own", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "attendance", action: "view_team", roles: ["Manager"] },
  { module: "attendance", action: "view_all", roles: ["HR", "Admin"] },

  { module: "leave_types", action: "manage", roles: ["HR", "Admin"] },
  { module: "leave_types", action: "view", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "leave", action: "set_quota", roles: ["HR", "Admin"] },
  { module: "leave", action: "submit", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "leave", action: "approve", roles: ["Manager", "HR", "Admin"] },
  { module: "leave", action: "cancel_pending", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "leave", action: "cancel_approved", roles: ["Manager", "HR", "Admin"] },
  { module: "leave", action: "view_own", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "leave", action: "view_team", roles: ["Manager"] },
  { module: "leave", action: "view_all", roles: ["HR", "Admin"] },

  { module: "goals", action: "create", roles: ["Manager"] },
  { module: "goals", action: "edit", roles: ["Manager"] },
  { module: "goals", action: "record_actual", roles: ["Manager"] },
  { module: "goals", action: "view_own", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "goals", action: "view_team", roles: ["Manager"] },
  { module: "goals", action: "view_all", roles: ["HR", "Admin"] },

  { module: "training_categories", action: "manage", roles: ["HR", "Admin"] },
  { module: "training_categories", action: "view", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "training", action: "upload", roles: ["Manager"] },
  { module: "training", action: "assign", roles: ["Manager"] },
  { module: "training", action: "remove_assignment", roles: ["Manager", "HR", "Admin"] },
  { module: "training", action: "view_assigned", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "training", action: "view_own_uploads", roles: ["Manager"] },
  { module: "training", action: "view_all", roles: ["HR", "Admin"] },

  { module: "roles", action: "view", roles: ["HR", "Admin"] },
  { module: "roles", action: "manage", roles: ["Admin"] },
  { module: "departments", action: "create", roles: ["HR", "Admin"] },
  { module: "departments", action: "view", roles: ["Admin", "HR", "Manager", "Employee"] },
  { module: "departments", action: "edit", roles: ["HR", "Admin"] },
  { module: "departments", action: "delete", roles: ["HR", "Admin"] },
  { module: "users", action: "view", roles: ["HR", "Admin"] },
  { module: "users", action: "reset_password", roles: ["HR", "Admin"] },
  { module: "users", action: "update_status", roles: ["HR", "Admin"] },

  { module: "permissions", action: "view", roles: ["Admin"] },
  { module: "permissions", action: "manage", roles: ["Admin"] },
];

export const hasPermission = (roleName, module, action) => {
  const entry = PERMISSION_MATRIX.find((p) => p.module === module && p.action === action);
  return entry ? entry.roles.includes(roleName) : false;
};

export const SEEDED_ROLES = ["Admin", "HR", "Manager", "Employee"];

// Mirrors the backend: Admin > HR > Manager > Employee; custom roles rank as Employee.
export const ROLE_RANK = { Admin: 4, HR: 3, Manager: 2, Employee: 1 };

export const rankOf = (role) => (role && !role.isCustom && ROLE_RANK[role.name]) || ROLE_RANK.Employee;

// roles.manage may assign any role; everyone else only roles ranked strictly below their own.
export const canAssignRole = (roleName, role) =>
  hasPermission(roleName, "roles", "manage") || rankOf(role) < rankOf({ name: roleName });

// Admin may act on anyone; everyone else only on users ranked strictly below them.
export const outranks = (roleName, targetRole) => {
  const rank = rankOf({ name: roleName });
  return rank === ROLE_RANK.Admin || rank > rankOf(targetRole);
};
