import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { DateRangeField, toYmd } from '@/components/form/DatePicker'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { useListFilters } from '@/hooks/useListFilters'
import { useDepartments } from '@/hooks/useDepartments'
import { useAllAttendance } from '@/hooks/useAllAttendance'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'
import AttendanceEditModal from '@/pages/attendance/components/AttendanceEditModal'

const LIMIT = 10

const columns = [
  { key: 'employee', header: 'Employee' },
  { key: 'date', header: 'Date' },
  { key: 'status', header: 'Status' },
  { key: 'clockIn', header: 'Clock In' },
  { key: 'clockOut', header: 'Clock Out' },
  { key: 'actions', header: 'Actions' },
]

const STATUS_OPTIONS = ['Present', 'Late', 'Half-day', 'Absent'].map((s) => ({
  value: s,
  label: s,
}))

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function fmtTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'p')
}

export default function AllAttendancePage() {
  // status, departmentId and employee are { value, label } options.
  const { filters, page, setFilter, setPage } = useListFilters({
    status: null,
    departmentId: null,
    employee: null,
    range: undefined,
  })
  const { status, departmentId, employee, range } = filters
  const [editTarget, setEditTarget] = useState(null)

  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departmentOptions = (deptData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(employee ? { employeeId: employee.value } : {}),
      ...(status ? { status: status.value } : {}),
      ...(departmentId ? { departmentId: departmentId.value } : {}),
      ...(range?.from ? { startDate: toYmd(range.from) } : {}),
      ...(range?.to ? { endDate: toYmd(range.to) } : {}),
    }),
    [page, employee, status, departmentId, range],
  )

  const { data, isLoading, isError, error, refetch } = useAllAttendance(params)
  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Employee</label>
          <EmployeeSearchSelect
            value={employee}
            onChange={(opt) => setFilter('employee', opt ?? null)}
            placeholder="Any employee"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <Select
            isClearable
            options={STATUS_OPTIONS}
            value={status}
            onChange={(opt) => setFilter('status', opt ?? null)}
            placeholder="Any status"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
          <Select
            isClearable
            options={departmentOptions}
            value={departmentId}
            onChange={(opt) => setFilter('departmentId', opt ?? null)}
            placeholder="Any department"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date range</label>
          <DateRangeField
            value={range}
            onChange={(next) => setFilter('range', next)}
            placeholder="Any dates"
            className="w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load attendance.'}
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
            emptyMessage="No attendance records match these filters"
            renderRow={(rec) => (
              <tr
                key={rec.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{rec.employee?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-text">{fmtDate(rec.date)}</td>
                <td className="px-4 py-3">
                  <AttendanceStatusBadge
                    status={rec.status}
                    isManualOverride={rec.isManualOverride}
                  />
                </td>
                <td className="px-4 py-3 text-text">{fmtTime(rec.clockIn)}</td>
                <td className="px-4 py-3 text-text">{fmtTime(rec.clockOut)}</td>
                <td className="px-4 py-3">
                  <IconButton
                    icon="lucide:pencil"
                    label="Edit record"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditTarget(rec)}
                  />
                </td>
              </tr>
            )}
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

      {editTarget && (
        <AttendanceEditModal
          key={editTarget.id}
          record={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
