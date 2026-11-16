import { useMyProfile } from '@/hooks/useMyProfile'
import { useAuth } from '@/store/AuthContext'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import EmployeeDetailView from '@/pages/employees/components/EmployeeDetailView'

export default function MyProfilePage() {
  const { can } = useAuth()
  const { data, isLoading, isError, error, refetch } = useMyProfile()

  const canEdit = can('employees', 'edit')
  const editHref = data?.id
    ? `/employees/${data.id}/edit`
    : null

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
          {error?.message || 'Could not load your profile.'}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Your account has no employee profile yet.
      </div>
    )
  }

  return (
    <EmployeeDetailView
      data={data}
      canEdit={canEdit}
      editHref={editHref}
      heading="My Profile"
    />
  )
}
