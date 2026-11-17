import { useParams } from 'react-router-dom'
import { useEmployee } from '@/hooks/useEmployee'
import { useAuth } from '@/store/useAuth'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import EmployeeDetailView from '@/pages/employees/components/EmployeeDetailView'
import EmployeeDetailSkeleton from '@/pages/employees/components/EmployeeDetailSkeleton'

export default function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const { can } = useAuth()
  const { data, isLoading, isError, error, refetch, isRefetching } = useEmployee(employeeId)

  const canEdit = can('employees', 'edit')
  const editHref = `/employees/${employeeId}/edit`

  if (isLoading) return <EmployeeDetailSkeleton />

  if (isError) {
    return (
      <Card>
        <ErrorState
          message={error?.message || 'Could not load this employee.'}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </Card>
    )
  }

  return <EmployeeDetailView data={data} canEdit={canEdit} editHref={editHref} />
}
