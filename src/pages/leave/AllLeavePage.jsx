import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import 'react-day-picker/style.css'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/store/AuthContext'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useEmployees } from '@/hooks/useEmployees'
import { useAllLeaveRequests } from '@/hooks/useAllLeaveRequests'
import {
  useRejectLeaveRequest,
  useCancelLeaveRequest,
} from '@/hooks/useLeaveRequestMutations'
import { computeLeaveDays } from '@/pages/leave/utils/computeLeaveDays'
import { canCancelLeaveRequest } from '@/pages/leave/utils/canCancelLeaveRequest'
import LeaveStatusBadge from '@/pages/leave/components/LeaveStatusBadge'
import LeaveBalanceChip from '@/pages/leave/components/LeaveBalanceChip'
import ApproveLeaveModal from '@/pages/leave/components/ApproveLeaveModal'
import LeaveTypesTab from '@/pages/leave/components/LeaveTypesTab'

const LIMIT = 10
const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => ({
  value: s,
  label: s,
}))

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'types', label: 'Leave Types' },
]

const columns = [
  { key: 'employee', header: 'Employee' },
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'dates', header: 'Dates' },
  { key: 'days', header: 'Days' },
  { key: 'status', header: 'Status' },
  { key: 'balance', header: 'Balance' },
  { key: 'actions', header: 'Actions' },
]

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

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

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function DateRangeField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'PP')} – ${format(value.to, 'PP')}`
      : `${format(value.from, 'PP')} – …`
    : 'Any dates'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={value?.from ? 'text-text' : 'text-gray-400'}>{label}</span>
        <span className="flex items-center gap-2">
          {value?.from && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onChange(undefined)
                }
              }}
              className="text-xs text-gray-400 hover:text-text"
            >
              Clear
            </span>
          )}
          <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={{
            '--rdp-accent-color': '#059c99',
            '--rdp-accent-background-color': '#e6f4f3',
          }}
        >
          <DayPicker mode="range" selected={value} onSelect={onChange} />
        </div>
      )}
    </div>
  )
}

function RequestsTab() {
  const { user } = useAuth()
  const { data: profile } = useMyProfile()
  const currentEmployeeId = profile?.id ?? null

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [range, setRange] = useState(undefined)
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const [employeeQuery, setEmployeeQuery] = useState('')
  const debouncedEmployeeQuery = useDebouncedValue(employeeQuery.trim(), 300)
  const { data: empData } = useEmployees({
    page: 1,
    limit: 20,
    ...(debouncedEmployeeQuery ? { search: debouncedEmployeeQuery } : {}),
  })
  const employeeOptions = (empData?.rows ?? []).map((e) => ({
    value: e.id,
    label: e.fullName,
  }))

  useEffect(() => {
    setPage(1)
  }, [status, employee, range])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(employee ? { employeeId: employee.value } : {}),
      ...(status ? { status: status.value } : {}),
      ...(range?.from ? { startDate: toYmd(range.from) } : {}),
      ...(range?.to ? { endDate: toYmd(range.to) } : {}),
    }),
    [page, employee, status, range],
  )

  const { data, isLoading, isError, error, refetch } = useAllLeaveRequests(params)
  const rejectMutation = useRejectLeaveRequest()
  const cancelMutation = useCancelLeaveRequest()

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Employee</label>
          <Select
            isClearable
            options={employeeOptions}
            filterOption={() => true}
            onInputChange={(v) => setEmployeeQuery(v)}
            value={employee}
            onChange={(opt) => setEmployee(opt ?? null)}
            placeholder="Any employee"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <Select
            isClearable
            options={STATUS_OPTIONS}
            value={status}
            onChange={(opt) => setStatus(opt ?? null)}
            placeholder="Any status"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Start date range</label>
          <DateRangeField value={range} onChange={setRange} />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load leave requests.'}
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
            emptyMessage="No leave requests match these filters"
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
                        <IconButton
                          icon="lucide:check"
                          label="Approve"
                          variant="success"
                          size="sm"
                          onClick={() => setApproveTarget(req)}
                        />
                      )}
                      {isPending && (
                        <IconButton
                          icon="lucide:x"
                          label="Reject"
                          variant="secondary"
                          size="sm"
                          onClick={() => setRejectTarget(req)}
                        />
                      )}
                      {showCancel && (
                        <IconButton
                          icon="lucide:ban"
                          label="Cancel request"
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelTarget(req)}
                        />
                      )}
                    </div>
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

export default function AllLeavePage() {
  const [activeKey, setActiveKey] = useState('requests')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'requests' ? <RequestsTab /> : <LeaveTypesTab />}
    </div>
  )
}
