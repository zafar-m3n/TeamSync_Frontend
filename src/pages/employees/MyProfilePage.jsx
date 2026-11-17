import { useMyProfile } from '@/hooks/useMyProfile'
import { useAuth } from '@/store/useAuth'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { describeError } from '@/lib/errors'
import EmployeeDetailView from '@/pages/employees/components/EmployeeDetailView'
import EmployeeDetailSkeleton from '@/pages/employees/components/EmployeeDetailSkeleton'
import ChangePasswordForm from '@/pages/employees/components/ChangePasswordForm'

export default function MyProfilePage() {
  const { can } = useAuth()
  const { data, isLoading, isError, error, refetch, isRefetching } = useMyProfile()

  const canEdit = can('employees', 'edit')
  const editHref = data?.id ? `/employees/${data.id}/edit` : null

  if (isLoading) return <EmployeeDetailSkeleton label="Loading your profile" />

  let profile
  if (isError) {
    profile = (
      <Card>
        <ErrorState
          {...describeError(error, 'Could not load your profile.')}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </Card>
    )
  } else if (!data) {
    profile = (
      <Card>
        <EmptyState icon="lucide:user-round-x" message="Your account has no employee profile yet." />
      </Card>
    )
  } else {
    profile = <EmployeeDetailView data={data} canEdit={canEdit} editHref={editHref} heading="My Profile" />
  }

  return (
    <div className="space-y-6">
      {profile}
      <ChangePasswordForm />
    </div>
  )
}
