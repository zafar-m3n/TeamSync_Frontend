import { useMemo, useState } from 'react'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import IconButton from '@/components/ui/IconButton'
import FormField from '@/components/form/FormField'
import { DateRangeField, toYmd } from '@/components/form/DatePicker'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { useListFilters } from '@/hooks/useListFilters'
import { useDepartments } from '@/hooks/useDepartments'
import { useAllAttendance } from '@/hooks/useAllAttendance'
import AttendanceStatusBadge from '@/pages/attendance/components/AttendanceStatusBadge'
import AttendanceEditModal from '@/pages/attendance/components/AttendanceEditModal'
import { fmtDate, fmtTime } from '@/pages/attendance/utils/attendanceFormat'

const LIMIT = 10

const columns = [
  { key: 'employee', header: 'Employee', className: 'font-medium', render: (r) => r.employee?.fullName ?? '—' },
  { key: 'date', header: 'Date', className: 'whitespace-nowrap tabular-nums', render: (r) => fmtDate(r.date) },
  { key: 'status', header: 'Status', render: (r) => <AttendanceStatusBadge status={r.status} isManualOverride={r.isManualOverride} /> },
  { key: 'clockIn', header: 'Clock In', className: 'tabular-nums', render: (r) => fmtTime(r.clockIn) },
  { key: 'clockOut', header: 'Clock Out', className: 'tabular-nums', render: (r) => fmtTime(r.clockOut) },
]

const STATUS_OPTIONS = ['Present', 'Late', 'Half-day', 'Absent'].map((s) => ({
  value: s,
  label: s,
}))

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

  const { data, isLoading, isFetching, isError, error, refetch } = useAllAttendance(params)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FormField label="Employee">
          <EmployeeSearchSelect value={employee} onChange={(opt) => setFilter('employee', opt ?? null)} placeholder="Any employee" />
        </FormField>
        <FormField label="Status">
          <Select
            isClearable
            options={STATUS_OPTIONS}
            value={status}
            onChange={(opt) => setFilter('status', opt ?? null)}
            placeholder="Any status"
          />
        </FormField>
        <FormField label="Department">
          <Select
            isClearable
            options={departmentOptions}
            value={departmentId}
            onChange={(opt) => setFilter('departmentId', opt ?? null)}
            placeholder="Any department"
          />
        </FormField>
        <FormField label="Date range">
          <DateRangeField value={range} onChange={(next) => setFilter('range', next)} placeholder="Any dates" />
        </FormField>
      </div>

      <Table
        caption="Attendance records"
        columns={columns}
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        loadingRows={LIMIT}
        error={isError ? error?.message || 'Could not load attendance.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:calendar-x"
        emptyMessage="No attendance records match these filters"
        rowActions={(rec) => (
          <IconButton icon="lucide:pencil" label="Edit record" variant="ghost" size="sm" onClick={() => setEditTarget(rec)} />
        )}
      />

      {editTarget && <AttendanceEditModal key={editTarget.id} record={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  )
}
