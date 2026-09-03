import { useParams } from 'react-router-dom'
import { useEmployee } from '@/hooks/useEmployee'
import { useAuth } from '@/store/AuthContext'
import { hasPermission } from '@/lib/permissions'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import EmployeeDetailView from '@/pages/employees/components/EmployeeDetailView'

export default function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useEmployee(employeeId)

  const canEdit = hasPermission(user.roleName, 'employees', 'edit')
  const editHref = `/${user.roleName.toLowerCase()}/employees/${employeeId}/edit`

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-accent" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-gray-600">
          {error?.message || 'Could not load this employee.'}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    )
  }

  return <EmployeeDetailView data={data} canEdit={canEdit} editHref={editHref} />
}
