import IconButton from '@/components/ui/IconButton'
import { canCancelLeaveRequest } from '@/pages/leave/utils/canCancelLeaveRequest'
import { canActOnLeaveRequest } from '@/pages/leave/utils/canActOnLeaveRequest'

// Approve / Reject / Cancel for one request, each shown only when the rules allow it.
// onAction(kind, request) with kind 'approve' | 'reject' | 'cancel'.
export default function LeaveRequestActions({ request, currentUser, currentEmployeeId, onAction }) {
  const ctx = { request, currentUser, currentEmployeeId }
  const canAct = canActOnLeaveRequest(ctx)
  const showCancel = canCancelLeaveRequest(ctx)

  return (
    <>
      {canAct && (
        <IconButton icon="lucide:check" label="Approve" variant="success" size="sm" onClick={() => onAction('approve', request)} />
      )}
      {canAct && (
        <IconButton icon="lucide:x" label="Reject" variant="secondary" size="sm" onClick={() => onAction('reject', request)} />
      )}
      {showCancel && (
        <IconButton icon="lucide:ban" label="Cancel request" variant="ghost-danger" size="sm" onClick={() => onAction('cancel', request)} />
      )}
    </>
  )
}
