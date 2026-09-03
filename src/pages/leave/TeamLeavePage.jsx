import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/store/AuthContext'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useTeamLeaveRequests } from '@/hooks/useTeamLeaveRequests'
import {
  useRejectLeaveRequest,
  useCancelLeaveRequest,
} from '@/hooks/useLeaveRequestMutations'
import { computeLeaveDays } from '@/pages/leave/utils/computeLeaveDays'
import { canCancelLeaveRequest } from '@/pages/leave/utils/canCancelLeaveRequest'
import LeaveStatusBadge from '@/pages/leave/components/LeaveStatusBadge'
import LeaveBalanceChip from '@/pages/leave/components/LeaveBalanceChip'
import ApproveLeaveModal from '@/pages/leave/components/ApproveLeaveModal'

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled']

const columns = [
  { key: 'employee', header: 'Employee' },
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'dates', header: 'Dates' },
  { key: 'days', header: 'Days' },
  { key: 'status', header: 'Status' },
  { key: 'balance', header: 'Balance' },
  { key: 'actions', header: 'Actions' },
]

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function datesLabel(req) {
  if (req.isHalfDay) return `${fmtDate(req.startDate)} · Half day`
  if (req.startDate === req.endDate) return fmtDate(req.startDate)
  return `${fmtDate(req.startDate)} – ${fmtDate(req.endDate)}`
}

export default function TeamLeavePage() {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  const [status, setStatus] = useState('all')
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const params = useMemo(
    () => (status !== 'all' ? { status } : {}),
    [status],
  )

  const { data: rows = [], isLoading, isError, error, refetch } =
    useTeamLeaveRequests(params)
  const rejectMutation = useRejectLeaveRequest()
  const cancelMutation = useCancelLeaveRequest()

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load team leave requests.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={rows}
          emptyMessage="No leave requests from your team"
          renderRow={(req) => {
            const showCancel = canCancelLeaveRequest({
              request: req,
              currentUser: user,
              currentEmployeeId,
            })
            const isPending = req.status === 'Pending'
            return (
              <tr
                key={req.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{req.employee?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-text">{req.leaveType?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text">{datesLabel(req)}</td>
                <td className="px-4 py-3 text-text">
                  {computeLeaveDays(req.startDate, req.endDate, req.isHalfDay)}
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
                    {isPending && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setApproveTarget(req)}
                      >
                        Approve
                      </Button>
                    )}
                    {isPending && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRejectTarget(req)}
                      >
                        Reject
                      </Button>
                    )}
                    {showCancel && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelTarget(req)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          }}
        />
      )}

      {approveTarget && (
        <ApproveLeaveModal
          request={approveTarget}
          onClose={() => setApproveTarget(null)}
        />
      )}

      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject leave request"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejectTarget(null)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={rejectMutation.isPending}
              onClick={() =>
                rejectMutation.mutate(rejectTarget.id, {
                  onSuccess: () => setRejectTarget(null),
                })
              }
            >
              Reject
            </Button>
          </>
        }
      >
        <p>
          Reject this leave request from{' '}
          <strong>{rejectTarget?.employee?.fullName ?? 'this employee'}</strong>?
        </p>
      </Modal>

      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel leave request"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              Keep it
            </Button>
            <Button
              variant="danger"
              isLoading={cancelMutation.isPending}
              onClick={() =>
                cancelMutation.mutate(cancelTarget.id, {
                  onSuccess: () => setCancelTarget(null),
                })
              }
            >
              Cancel request
            </Button>
          </>
        }
      >
        <p>Cancel this leave request? This can&rsquo;t be undone.</p>
      </Modal>
    </div>
  )
}
