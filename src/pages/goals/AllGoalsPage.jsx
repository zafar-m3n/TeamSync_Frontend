import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { format } from 'date-fns'
import clsx from 'clsx'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { useEmployees } from '@/hooks/useEmployees'
import { useAllGoals } from '@/hooks/useAllGoals'

const LIMIT = 10
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// No Actions column — HR/Admin have no edit or record-actual capability on any
// goal, so this page is deliberately read-only oversight.
const columns = [
  { key: 'employee', header: 'Employee' },
  { key: 'title', header: 'Title' },
  { key: 'targetDate', header: 'Target Date' },
  { key: 'numericTarget', header: 'Numeric Target' },
  { key: 'actualValue', header: 'Actual Value' },
  { key: 'progress', header: 'Progress' },
  { key: 'description', header: 'Description' },
]

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

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function pctLabel(value) {
  return `${Math.round(Number(value) || 0)}%`
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function AllGoalsPage() {
  const [page, setPage] = useState(1)
  const [employee, setEmployee] = useState(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

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
  }, [employee, year, month])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(employee ? { employeeId: employee.value } : {}),
      ...(year ? { year: Number(year) } : {}),
      // Month is only sent alongside a year — the backend ignores it otherwise.
      ...(year && month ? { month: Number(month) } : {}),
    }),
    [page, employee, year, month],
  )

  const { data, isLoading, isError, error, refetch } = useAllGoals(params)
  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <label className="mb-1 block text-xs font-medium text-gray-500">Year</label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value)
              if (!e.target.value) setMonth('')
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Any year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Month</label>
          <select
            value={month}
            disabled={!year}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Any month</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load goals.'}
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
            emptyMessage="No goals match these filters"
            renderRow={(goal) => (
              <tr
                key={goal.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{goal.employee?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-text">{goal.title}</td>
                <td className="px-4 py-3 text-text">{fmtDate(goal.targetDate)}</td>
                <td className="px-4 py-3 text-text">{goal.numericTarget}</td>
                <td className="px-4 py-3 text-text">{goal.actualValue ?? '—'}</td>
                <td className="px-4 py-3">
                  <ProgressBar
                    value={goal.percentComplete}
                    label={pctLabel(goal.percentComplete)}
                  />
                </td>
                <td
                  className="max-w-xs truncate px-4 py-3 text-text"
                  title={goal.description || undefined}
                >
                  {goal.description || '—'}
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
    </div>
  )
}
