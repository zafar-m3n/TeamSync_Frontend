import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/form/Input'
import { useEmployees } from '@/hooks/useEmployees'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useDepartments } from '@/hooks/useDepartments'

const LIMIT = 10

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const allColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'employeeCode', header: 'Employee Code' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
  { key: 'shift', header: 'Shift' },
]

const teamColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
]

function TeamList() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading, isError, error, refetch } = useMyTeam()

  if (isLoading) return <TableSkeleton columns={teamColumns} rows={5} />
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
        <p className="text-sm text-gray-600">{error?.message || 'Could not load your team.'}</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <Table
      columns={teamColumns}
      rows={rows}
      emptyMessage="No direct reports yet"
      renderRow={(emp) => (
        <tr
          key={emp.id}
          onClick={() => navigate(String(emp.id))}
          className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
        >
          <td className="px-4 py-3 text-text">{emp.fullName}</td>
          <td className="px-4 py-3 text-text">{emp.department?.name ?? '—'}</td>
          <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
        </tr>
      )}
    />
  )
}

function AllList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentId])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(departmentId ? { departmentId: Number(departmentId) } : {}),
    }),
    [page, debouncedSearch, departmentId],
  )

  const { data, isLoading, isError, error, refetch } = useEmployees(params)
  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departments = deptData?.rows ?? []

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search employees…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <Button
          variant="accent"
          className="ml-auto"
          onClick={() => navigate('new')}
        >
          New Employee
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={allColumns} rows={LIMIT} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load employees.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <Table
            columns={allColumns}
            rows={rows}
            emptyMessage="No employees yet — add your first employee"
            emptyAction={
              <Button variant="accent" size="sm" onClick={() => navigate('new')}>
                New Employee
              </Button>
            }
            renderRow={(emp) => (
              <tr
                key={emp.id}
                onClick={() => navigate(String(emp.id))}
                className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-text">{emp.fullName}</td>
                <td className="px-4 py-3 text-text">{emp.employeeCode ?? '—'}</td>
                <td className="px-4 py-3 text-text">{emp.department?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
                <td className="px-4 py-3 text-text">{emp.shift?.name ?? '—'}</td>
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

export default function EmployeeListPage({ scope }) {
  return scope === 'team' ? <TeamList /> : <AllList />
}
