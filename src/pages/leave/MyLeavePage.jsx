import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import Table from '../../components/ui/Table'
import TableSkeleton from '../../components/ui/TableSkeleton'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../store/AuthContext'
import { useMyProfile } from '../../hooks/useMyProfile'
import { useLeaveBalance } from '../../hooks/useLeaveBalance'
import { useMyLeaveRequests } from '../../hooks/useMyLeaveRequests'
import { useCancelLeaveRequest } from '../../hooks/useLeaveRequestMutations'
import { computeLeaveDays } from './utils/computeLeaveDays'
import { canCancelLeaveRequest } from './utils/canCancelLeaveRequest'
import LeaveStatusBadge from './components/LeaveStatusBadge'
import LeaveRequestFormModal from './components/LeaveRequestFormModal'

const LIMIT = 10
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

const columns = [
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'dates', header: 'Dates' },
  { key: 'days', header: 'Days' },
  { key: 'status', header: 'Status' },
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

export default function MyLeavePage() {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  const [year, setYear] = useState(CURRENT_YEAR)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const { data: balance } = useLeaveBalance(currentEmployeeId, year)

  useEffect(() => {
    setPage(1)
  }, [status])

  const params = useMemo(
    () => ({ page, limit: LIMIT, ...(status !== 'all' ? { status } : {}) }),
    [page, status],
  )

  const { data, isLoading, isError, error, refetch } = useMyLeaveRequests(params)
  const cancelMutation = useCancelLeaveRequest()

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <Button variant="accent" className="ml-auto" onClick={() => setShowForm(true)}>
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={balance?.remaining ?? '—'} label="Remaining" tone="success" />
        <StatCard value={balance?.usedDays ?? '—'} label="Used" />
        <StatCard value={balance?.totalDays ?? '—'} label="Total" />
      </div>

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
          <TableSkeleton columns={columns} rows={LIMIT} />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-600">
              {error?.message || 'Could not load your leave requests.'}
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              rows={rows}
              emptyMessage="No leave requests yet"
              renderRow={(req) => {
                const showCancel = canCancelLeaveRequest({
                  request: req,
                  currentUser: user,
                  currentEmployeeId,
                })
                return (
                  <tr
                    key={req.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-text">{req.leaveType?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text">{datesLabel(req)}</td>
                    <td className="px-4 py-3 text-text">
                      {computeLeaveDays(req.startDate, req.endDate, req.isHalfDay)}
                    </td>
                    <td className="px-4 py-3">
                      <LeaveStatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      {showCancel && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelTarget(req)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              }}
            />

            {meta && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {meta.page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <LeaveRequestFormModal onClose={() => setShowForm(false)} />}

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
