import { useDashboard } from '@/hooks/useDashboard'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import EmployeeDashboardView from '@/pages/dashboard/components/EmployeeDashboardView'
import ManagerDashboardView from '@/pages/dashboard/components/ManagerDashboardView'
import AdminDashboardView from '@/pages/dashboard/components/AdminDashboardView'

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

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
          {error?.message || 'Something went wrong loading your dashboard.'}
        </p>
        <Button onClick={() => refetch()} isLoading={isFetching}>
          Try again
        </Button>
      </div>
    )
  }

  if (data.layout === 'manager') return <ManagerDashboardView data={data} />
  if (data.layout === 'admin') return <AdminDashboardView data={data} />
  return <EmployeeDashboardView data={data} />
}
