import { hasPermission } from '../../../lib/permissions'

export const canCancelLeaveRequest = ({ request, currentUser, currentEmployeeId }) => {
  // getMyLeaveRequests doesn't include `employee` — on MyLeavePage every row is
  // always the caller's own, so no `employee` means treat as owner.
  const isOwner = request.employee
    ? request.employee.userId === currentUser.id
    : true
  const isManagerOfTarget = request.employee?.managerId === currentEmployeeId
  const hasViewAll = hasPermission(currentUser.roleName, 'leave', 'view_all')

  if (request.status === 'Pending') {
    const canCancelPending = hasPermission(
      currentUser.roleName,
      'leave',
      'cancel_pending',
    )
    if (!canCancelPending) return false
    return isOwner || hasViewAll || isManagerOfTarget
  }

  if (request.status === 'Approved') {
    const canCancelApproved = hasPermission(
      currentUser.roleName,
      'leave',
      'cancel_approved',
    )
    if (!canCancelApproved) return false
    // No owner shortcut on Approved — deliberate, matches the backend: an
    // Approved request can only be cancelled by a cancel_approved holder who
    // also has view_all or is the requester's manager, whoever's request it is.
    return hasViewAll || isManagerOfTarget
  }

  return false // Rejected / Cancelled are already final
}
