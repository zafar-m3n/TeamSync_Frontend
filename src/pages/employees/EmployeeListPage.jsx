import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/store/useAuth'
import { outranks } from '@/lib/permissions'
import { useEmployeeListFilters } from '@/pages/employees/list/useEmployeeListFilters'
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

  // Omit delete entirely (never a disabled button) when it can't apply: no
  // permission, this is the current user's own employee record, or the target
  // ranks at or above the current user.
  const deleteHandlerFor = (emp) =>
    canDelete && emp.userId !== user.id && outranks(user, emp.user?.role)
      ? () => setDeleteTarget(emp)
      : null

  const { data, isLoading, isFetching, isError, error, refetch } = useEmployees(filters.params)

  return (
    <div className="space-y-5">
      <EmployeeFilters filters={filters} onNew={() => navigate('new')} />

      <EmployeeTable
        rows={data?.rows ?? []}
        meta={data?.meta}
        onPageChange={filters.setPage}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError ? error?.message || 'Could not load employees.' : null}
        onRetry={() => refetch()}
        navigate={navigate}
        deleteHandlerFor={deleteHandlerFor}
      />

      <DeleteEmployeeDialog employee={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}

export default function EmployeeListPage({ scope }) {
  return scope === 'team' ? <TeamList /> : <AllList />
}
