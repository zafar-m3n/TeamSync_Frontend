import { useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'
import Table from '../../components/ui/Table'
import TableSkeleton from '../../components/ui/TableSkeleton'
import Button from '../../components/ui/Button'
import { useEmployees } from '../../hooks/useEmployees'
import { useDepartments } from '../../hooks/useDepartments'
import { useAllAttendance } from '../../hooks/useAllAttendance'
import AttendanceStatusBadge from './components/AttendanceStatusBadge'
import AttendanceEditModal from './components/AttendanceEditModal'

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

const rsClassNames = {
  control: ({ isFocused }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
      isFocused ? 'border-accent ring-2 ring-accent' : 'border-gray-300',
    ),
  valueContainer: () => 'px-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  dropdownIndicator: () => 'px-1.5 text-gray-400',
  clearIndicator: () => 'px-1.5 text-gray-400 hover:text-text',
  indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
  menu: () => 'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
  menuList: () => 'py-1',
  option: ({ isFocused, isSelected }) =>
    clsx(
      'cursor-pointer px-3 py-2 text-sm',
      isSelected
        ? 'bg-accent text-white'
        : isFocused
          ? 'bg-gray-100 text-text'
          : 'text-text',
    ),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-gray-400',
}

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

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
        className="flex w-72 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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

export default function AllAttendancePage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(null)
  const [departmentId, setDepartmentId] = useState(null)
  const [employee, setEmployee] = useState(null) // { value, label }
  const [range, setRange] = useState(undefined)
  const [editTarget, setEditTarget] = useState(null)

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

  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departmentOptions = (deptData?.rows ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  useEffect(() => {
    setPage(1)
  }, [status, departmentId, employee, range])

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
          <Select
            unstyled
            isClearable
            classNames={rsClassNames}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
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
            unstyled
            isClearable
            classNames={rsClassNames}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
            options={STATUS_OPTIONS}
            value={status}
            onChange={(opt) => setStatus(opt ?? null)}
            placeholder="Any status"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
          <Select
            unstyled
            isClearable
            classNames={rsClassNames}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
            options={departmentOptions}
            value={departmentId}
            onChange={(opt) => setDepartmentId(opt ?? null)}
            placeholder="Any department"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date range</label>
          <DateRangeField value={range} onChange={setRange} />
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditTarget(rec)}
                  >
                    Edit
                  </Button>
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
