import { useDashboard } from '@/hooks/useDashboard'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import { describeError } from '@/lib/errors'
import EmployeeDashboardView from '@/pages/dashboard/components/EmployeeDashboardView'
import ManagerDashboardView from '@/pages/dashboard/components/ManagerDashboardView'
import AdminDashboardView from '@/pages/dashboard/components/AdminDashboardView'
import { DashboardSkeleton } from '@/pages/dashboard/components/DashboardParts'

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <Card padding="none">
        <ErrorState
          title="Your dashboard didn't load"
          {...describeError(error, 'Something went wrong loading your dashboard.')}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </Card>
    )
  }

  if (data.layout === 'manager') return <ManagerDashboardView data={data} />
  if (data.layout === 'admin') return <AdminDashboardView data={data} />
  return <EmployeeDashboardView data={data} />
}
