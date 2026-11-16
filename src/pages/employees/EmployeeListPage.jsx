import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/store/AuthContext'
import { outranks } from '@/lib/permissions'
import { useEmployeeListFilters } from '@/pages/employees/list/useEmployeeListFilters'
import { LIMIT, allColumns } from '@/pages/employees/list/employeeListConfig'
import { ListError, ListSkeleton } from '@/pages/employees/list/EmployeeListParts'
import EmployeeFilters from '@/pages/employees/list/EmployeeFilters'
import EmployeeTable from '@/pages/employees/list/EmployeeTable'
import DeleteEmployeeDialog from '@/pages/employees/list/DeleteEmployeeDialog'
import TeamList from '@/pages/employees/list/TeamList'

function AllList() {
  const navigate = useNavigate()
  const { user, can } = useAuth()
  const canDelete = can('employees', 'delete')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const filters = useEmployeeListFilters()
  const { page, setPage } = filters

  // Omit delete entirely (never a disabled button) when it can't apply: no
  // permission, this is the current user's own employee record, or the target
  // ranks at or above the current user.
  const deleteHandlerFor = (emp) =>
    canDelete && emp.userId !== user.id && outranks(user, emp.user?.role)
      ? () => setDeleteTarget(emp)
      : null

  const { data, isLoading, isError, error, refetch } = useEmployees(filters.params)

  const rows = data?.rows ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <EmployeeFilters filters={filters} onNew={() => navigate('new')} />

      {isLoading ? (
        <ListSkeleton columns={allColumns} rows={LIMIT} />
      ) : isError ? (
        <ListError
          message={error?.message || 'Could not load employees.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <EmployeeTable rows={rows} navigate={navigate} deleteHandlerFor={deleteHandlerFor} />

          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
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
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <DeleteEmployeeDialog employee={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}

export default function EmployeeListPage({ scope }) {
  return scope === 'team' ? <TeamList /> : <AllList />
}
