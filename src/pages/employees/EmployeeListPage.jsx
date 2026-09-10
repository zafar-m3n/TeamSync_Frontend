import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Modal from '@/components/ui/Modal'
import Input from '@/components/form/Input'
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useDepartments } from '@/hooks/useDepartments'
import { useAuth } from '@/store/AuthContext'
import { hasPermission } from '@/lib/permissions'
import { toast } from '@/hooks/useToast'

const LIMIT = 10

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function getInitials(source) {
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({ name, className = 'h-8 w-8 text-xs' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}

function NameCell({ name }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar name={name} />
      <span className="font-medium text-text">{name ?? '—'}</span>
    </span>
  )
}

function RowActions({ empId, navigate, className, onDelete }) {
  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <IconButton
        icon="lucide:eye"
        label="View employee"
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          navigate(String(empId))
        }}
      />
      <IconButton
        icon="lucide:pencil"
        label="Edit employee"
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`${empId}/edit`)
        }}
      />
      {onDelete && (
        <IconButton
          icon="lucide:trash-2"
          label="Delete employee"
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        />
      )}
    </div>
  )
}

function ListSkeleton({ columns, rows }) {
  return (
    <>
      <div className="hidden md:block">
        <TableSkeleton columns={columns} rows={rows} />
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    </>
  )
}

const allColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'employeeCode', header: 'Employee Code' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
  { key: 'shift', header: 'Shift' },
  { key: 'actions', header: '' },
]

const teamColumns = [
  { key: 'fullName', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'designation', header: 'Designation' },
]

function TeamList() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading, isError, error, refetch } = useMyTeam()

  if (isLoading) return <ListSkeleton columns={teamColumns} rows={5} />
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
    <>
      <div className="hidden md:block">
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
              <td className="px-4 py-3 text-text">
                <NameCell name={emp.fullName} />
              </td>
              <td className="px-4 py-3 text-text">
                {emp.department?.name ? <Badge tone="neutral">{emp.department.name}</Badge> : '—'}
              </td>
              <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
            </tr>
          )}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-sm text-gray-500">No direct reports yet</p>
          </div>
        ) : (
          rows.map((emp) => (
            <div
              key={emp.id}
              onClick={() => navigate(String(emp.id))}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Avatar name={emp.fullName} className="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{emp.fullName ?? '—'}</p>
                  <p className="truncate text-xs text-gray-500">{emp.designation ?? '—'}</p>
                </div>
              </div>
              {emp.department?.name && (
                <div className="mt-3">
                  <Badge tone="neutral">{emp.department.name}</Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}

function AllList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canDelete = hasPermission(user.roleName, 'employees', 'delete')
  const deleteMutation = useDeleteEmployee()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  // Omit delete entirely (never a disabled button) when it can't apply: no
  // permission, or this is the current user's own employee record.
  const deleteHandlerFor = (emp) =>
    canDelete && emp.userId !== user.id ? () => setDeleteTarget(emp) : null

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
  const departmentOptions = [
    { value: '', label: 'All departments' },
    ...(deptData?.rows ?? []).map((d) => ({ value: String(d.id), label: d.name })),
  ]

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <Input
            type="search"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="w-56">
            <Select
              options={departmentOptions}
              value={departmentOptions.find((o) => o.value === departmentId) ?? null}
              onChange={(opt) => setDepartmentId(opt.value)}
            />
          </div>
        </div>
        <Button variant="accent" onClick={() => navigate('new')}>
          New Employee
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton columns={allColumns} rows={LIMIT} />
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
          <div className="hidden md:block">
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
                  <td className="px-4 py-3 text-text">
                    <NameCell name={emp.fullName} />
                  </td>
                  <td className="px-4 py-3 text-text">{emp.employeeCode ?? '—'}</td>
                  <td className="px-4 py-3 text-text">
                    {emp.department?.name ? (
                      <Badge tone="neutral">{emp.department.name}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-text">{emp.designation ?? '—'}</td>
                  <td className="px-4 py-3 text-text">
                    {emp.shift?.name ? <Badge tone="neutral">{emp.shift.name}</Badge> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      empId={emp.id}
                      navigate={navigate}
                      className="justify-end"
                      onDelete={deleteHandlerFor(emp)}
                    />
                  </td>
                </tr>
              )}
            />
          </div>

          <div className="space-y-3 md:hidden">
            {rows.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
                <p className="text-sm text-gray-500">
                  No employees yet — add your first employee
                </p>
                <div className="mt-4 flex justify-center">
                  <Button variant="accent" size="sm" onClick={() => navigate('new')}>
                    New Employee
                  </Button>
                </div>
              </div>
            ) : (
              rows.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(String(emp.id))}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={emp.fullName} className="h-10 w-10 text-sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text">
                          {emp.fullName ?? '—'}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {emp.employeeCode ?? '—'}
                        </p>
                      </div>
                    </div>
                    <RowActions
                      empId={emp.id}
                      navigate={navigate}
                      onDelete={deleteHandlerFor(emp)}
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-text">{emp.designation ?? '—'}</p>
                    {(emp.department?.name || emp.shift?.name) && (
                      <div className="flex flex-wrap gap-2">
                        {emp.department?.name && (
                          <Badge tone="neutral">{emp.department.name}</Badge>
                        )}
                        {emp.shift?.name && <Badge tone="neutral">{emp.shift.name}</Badge>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
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

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete employee"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success(`${deleteTarget.fullName} deleted`)
                    setDeleteTarget(null)
                  },
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.fullName}</strong>? This can’t be undone.
        </p>
      </Modal>
    </div>
  )
}

export default function EmployeeListPage({ scope }) {
  return scope === 'team' ? <TeamList /> : <AllList />
}
