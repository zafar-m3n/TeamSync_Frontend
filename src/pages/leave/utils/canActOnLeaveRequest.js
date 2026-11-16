import { hasPermission } from '@/lib/permissions'

// Mirrors the backend approve/reject rule: needs leave.approve, never your own
// request; view_all holders may act on anyone else's, others only on direct reports'.
export const canActOnLeaveRequest = ({ request, currentUser, currentEmployeeId }) => {
  if (request.status !== 'Pending') return false
  if (!hasPermission(currentUser.roleName, 'leave', 'approve')) return false
  if (!request.employee || request.employee.userId === currentUser.id) return false
  if (hasPermission(currentUser.roleName, 'leave', 'view_all')) return true
  return request.employee.managerId === currentEmployeeId
}
