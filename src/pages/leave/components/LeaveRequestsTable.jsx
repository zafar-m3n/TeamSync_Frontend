import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import { useAuth } from '@/store/useAuth'
import { useMyProfile } from '@/hooks/useMyProfile'
import { canCancelLeaveRequest } from '@/pages/leave/utils/canCancelLeaveRequest'
import { canActOnLeaveRequest } from '@/pages/leave/utils/canActOnLeaveRequest'
import { datesLabel } from '@/pages/leave/utils/leaveDates'
import LeaveStatusBadge from '@/pages/leave/components/LeaveStatusBadge'
import LeaveBalanceChip from '@/pages/leave/components/LeaveBalanceChip'
import { leaveRequestColumns } from '@/pages/leave/utils/leaveRequestList'

// onAction(kind, request) with kind 'approve' | 'reject' | 'cancel'.
export default function LeaveRequestsTable({ rows, onAction }) {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  return (
    <Table
      columns={leaveRequestColumns}
      rows={rows}
      emptyMessage="No leave requests match these filters"
      renderRow={(req) => {
        const showCancel = canCancelLeaveRequest({
          request: req,
          currentUser: user,
          currentEmployeeId,
        })
        const canAct = canActOnLeaveRequest({
          request: req,
          currentUser: user,
          currentEmployeeId,
        })
        return (
          <tr
            key={req.id}
            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <td className="px-4 py-3 text-text">{req.employee?.fullName ?? '—'}</td>
            <td className="px-4 py-3 text-text">{req.leaveType?.name ?? '—'}</td>
            <td className="px-4 py-3 text-text">{datesLabel(req)}</td>
            <td className="px-4 py-3 text-text">
              {req.days}
            </td>
            <td className="px-4 py-3">
              <LeaveStatusBadge status={req.status} />
            </td>
            <td className="px-4 py-3">
              {req.employee?.id != null && (
                <LeaveBalanceChip
                  employeeId={req.employee.id}
                  year={new Date(req.startDate).getFullYear()}
                />
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {canAct && (
                  <IconButton
                    icon="lucide:check"
                    label="Approve"
                    variant="success"
                    size="sm"
                    onClick={() => onAction('approve', req)}
                  />
                )}
                {canAct && (
                  <IconButton
                    icon="lucide:x"
                    label="Reject"
                    variant="secondary"
                    size="sm"
                    onClick={() => onAction('reject', req)}
                  />
                )}
                {showCancel && (
                  <IconButton
                    icon="lucide:ban"
                    label="Cancel request"
                    variant="danger"
                    size="sm"
                    onClick={() => onAction('cancel', req)}
                  />
                )}
              </div>
            </td>
          </tr>
        )
      }}
    />
  )
}
